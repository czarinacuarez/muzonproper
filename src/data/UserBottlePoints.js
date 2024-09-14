import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import moment from "moment-timezone";
import { FirebaseAuth } from "../firebase";

const firestore = getFirestore();

const getCurrentUserId = () => {
  const user = FirebaseAuth.currentUser;
  if (user) {
    return user.uid;
  } else {
    console.error("No user is currently logged in.");
    return null;
  }
};

export const fetchWeeklyBottlesForCurrentUser = async () => {
  const specificUserId = getCurrentUserId();
  if (!specificUserId) {
    return [];
  }
  const weeklyUsage = Array(7).fill(0);

  try {
    // Get the start and end of the current week, starting on Sunday
    const now = moment().tz("Asia/Manila");
    const startOfWeek = now.clone().startOf("week").toDate(); // Sunday as the start of the week
    const endOfWeek = now.clone().endOf("week").toDate(); // Saturday as the end of the week

    // Query to get documents within the past week for the current user
    const pointsQuery = query(
      collection(firestore, "pointsAddedHistory"),
      where("timestamp", ">=", startOfWeek),
      where("timestamp", "<=", endOfWeek),
      where("userId", "==", specificUserId), // Filter by user ID
    );

    const querySnapshot = await getDocs(pointsQuery);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const timestamp = data.timestamp.toDate(); // Convert Firestore Timestamp to JavaScript Date
      const localTime = moment(timestamp).tz("Asia/Manila");
      const dayOfWeek = localTime.day(); // Get day of the week (0 = Sunday, 6 = Saturday)

      // Ensure `totalBottles` is a number and accumulate it
      weeklyUsage[dayOfWeek] += data.totalBottles || 0;
    });
  } catch (error) {
    console.error("Error fetching machine usage data: ", error);
  }

  return weeklyUsage;
};
