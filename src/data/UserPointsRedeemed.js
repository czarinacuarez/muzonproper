import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import moment from 'moment-timezone';
import { getAuth } from "firebase/auth";

const firestore = getFirestore();

const getCurrentUserId = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    return user.uid;
  } else {
    console.error("No user is currently logged in.");
    return null;
  }
};

export const FetchUserRedeemReport = async () => {
  const specificUserId = getCurrentUserId(); 
  if (!specificUserId) {
    return [];
  }

  const dailyTransactions = {};

  try {
    const pointsQuery = query(
      collection(firestore, "pointsReductionHistory"),
      where("userId", "==", specificUserId),
    );

    const querySnapshot = await getDocs(pointsQuery);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const { points_deducted, timestamp } = data;

      const localTime = moment(timestamp.toDate()).tz('Asia/Manila');
      const date = localTime.format('YYYY-MM-DD');
      
      if (!dailyTransactions[date]) {
        dailyTransactions[date] = 0;
      }

      dailyTransactions[date] += points_deducted;
    });

    // Get sorted dates and daily totals
    const sortedDates = Object.keys(dailyTransactions).sort();
    const dailyTotals = sortedDates.map(date => dailyTransactions[date]);

    // Generate dates for the current week
    const startDate = moment().startOf('week'); 
    const endDate = moment().endOf('week'); 
    const weekDates = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      weekDates.push(currentDate.format('YYYY-MM-DD'));
      currentDate = currentDate.add(1, 'day');
    }

    // Align weekly totals with week dates
    const weeklyTotals = weekDates.map(date => dailyTransactions[date] || 0);

    return weeklyTotals;

  } catch (error) {
    console.error("Error fetching user daily transactions data: ", error);
    return [];
  }
};
