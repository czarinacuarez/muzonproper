import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import moment from "moment-timezone";

const firestore = getFirestore();

export const fetchMonthlyRequests = async () => {
  // Array to store monthly data for the year (12 months)
  const monthlyUsage = Array(12).fill(0);

  try {
    // Get the start and end of the current year
    const now = moment().tz("Asia/Manila");
    const startOfYear = now.startOf("year").toDate();
    const endOfYear = now.endOf("year").toDate();

    // Query to get documents within the current year
    const requestsQuery = query(
      collection(firestore, "pointsReductionHistory"), // Collection name
      where("timestamp", ">=", startOfYear), // Use `timestamp` for querying
      where("timestamp", "<=", endOfYear),
    );

    const querySnapshot = await getDocs(requestsQuery);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const timestamp = data.timestamp.toDate(); // Convert Firestore Timestamp to JavaScript Date
      const localTime = moment(timestamp).tz("Asia/Manila");
      const monthOfYear = localTime.month(); // Get the month (0-based index)

      // Increment the count for the corresponding month
      monthlyUsage[monthOfYear] += data.points_deducted || 0; // Use `points_deducted` field
    });
  } catch (error) {
    console.error("Error fetching request data: ", error);
  }

  return monthlyUsage;
};
