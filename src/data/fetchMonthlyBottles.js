import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import moment from "moment-timezone";

const firestore = getFirestore();

export const fetchMonthlyBottles = async () => {
  // Array to store monthly data for the year (12 months)
  const monthlyUsage = Array(12).fill(0);

  try {
    // Get the start and end of the current year
    const now = moment().tz("Asia/Manila");
    const startOfYear = now.startOf("year").toDate();
    const endOfYear = now.endOf("year").toDate();

    // Query to get documents within the current year
    const pointsQuery = query(
      collection(firestore, "pointsAddedHistory"),
      where("timestamp", ">=", startOfYear),
      where("timestamp", "<=", endOfYear),
    );

    const querySnapshot = await getDocs(pointsQuery);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const timestamp = data.timestamp.toDate(); // Convert Firestore Timestamp to JavaScript Date
      const localTime = moment(timestamp).tz("Asia/Manila");
      const monthOfYear = localTime.month(); // Get the month (0-based index)

      // Ensure `totalBottles` is a number
      monthlyUsage[monthOfYear] += data.totalBottles || 0;
    });
  } catch (error) {
    console.error("Error fetching machine usage data: ", error);
  }

  return monthlyUsage;
};
