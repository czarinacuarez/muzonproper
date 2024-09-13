import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import moment from "moment-timezone";

const firestore = getFirestore();

export const fetchTransaction = async () => {
  const dailyUsage = [0, 0, 0, 0, 0, 0, 0];

  try {
    // Get the start and end of the current week
    const now = moment().tz("Asia/Manila");
    const startOfWeek = now.startOf("week").toDate();
    const endOfWeek = now.endOf("week").toDate();

    // Query to get documents within the current week
    const pointsQuery = query(
      collection(firestore, "pointsAddedHistory"),
      where("timestamp", ">=", startOfWeek),
      where("timestamp", "<=", endOfWeek),
    );

    const querySnapshot = await getDocs(pointsQuery);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const timestamp = data.timestamp.toDate(); // Convert Firestore Timestamp to JavaScript Date
      const localTime = moment(timestamp).tz("Asia/Manila").toDate();
      const dayOfWeek = localTime.getDay();

      // Assuming `totalBottles` is a numeric field in your Firestore documents
      dailyUsage[dayOfWeek] += data.totalBottles || 0;
    });
  } catch (error) {
    console.error("Error fetching machine usage data: ", error);
  }

  return dailyUsage;
};
