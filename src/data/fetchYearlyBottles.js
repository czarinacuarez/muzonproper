import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import moment from "moment-timezone";

const firestore = getFirestore();

export const fetchYearlyTotals = async () => {
  // Array to store total accumulated bottles for the previous year and the current year
  const yearlyTotals = [0, 0]; // [previousYearTotal, currentYearTotal]

  try {
    const now = moment().tz("Asia/Manila");

    // Define start and end dates for the current year
    const startOfCurrentYear = now.startOf("year").toDate();
    const endOfCurrentYear = now.endOf("year").toDate();

    // Define start and end dates for the previous year
    const startOfPreviousYear = now
      .subtract(1, "year")
      .startOf("year")
      .toDate();
    const endOfPreviousYear = now.subtract(1, "year").endOf("year").toDate();

    // Query to get documents within the current year
    const currentYearQuery = query(
      collection(firestore, "pointsAddedHistory"),
      where("timestamp", ">=", startOfCurrentYear),
      where("timestamp", "<=", endOfCurrentYear),
    );

    // Query to get documents within the previous year
    const previousYearQuery = query(
      collection(firestore, "pointsAddedHistory"),
      where("timestamp", ">=", startOfPreviousYear),
      where("timestamp", "<=", endOfPreviousYear),
    );

    // Fetch and accumulate total bottles for the current year
    const currentYearSnapshot = await getDocs(currentYearQuery);
    currentYearSnapshot.forEach((doc) => {
      const data = doc.data();
      yearlyTotals[1] += data.totalBottles || 0; // Index 1 for the current year
    });

    // Fetch and accumulate total bottles for the previous year
    const previousYearSnapshot = await getDocs(previousYearQuery);
    previousYearSnapshot.forEach((doc) => {
      const data = doc.data();
      yearlyTotals[0] += data.totalBottles || 0; // Index 0 for the previous year
    });
  } catch (error) {
    console.error("Error fetching machine usage data: ", error);
  }

  return yearlyTotals; // Return the array [previousYearTotal, currentYearTotal]
};
