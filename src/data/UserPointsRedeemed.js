import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import moment from 'moment-timezone';
// import { getAuth } from "firebase/auth";
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
      const redeemedDataP = doc.data();
      const { points_deducted, timestamp } = redeemedDataP;

      const localTime = moment(timestamp.toDate()).tz('Asia/Manila');
      const date = localTime.format('YYYY-MM-DD');
      
      if (!dailyTransactions[date]) {
        dailyTransactions[date] = 0;
      }

      dailyTransactions[date] += points_deducted;
    });

    const sortedDates = Object.keys(dailyTransactions).sort();
    const dailyTotals = sortedDates.map(date => dailyTransactions[date]);

    const startDate = moment().startOf('week'); 
    const endDate = moment().endOf('week'); 
    const weekDates = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      weekDates.push(currentDate.format('YYYY-MM-DD'));
      currentDate = currentDate.add(1, 'day');
    }

    const weeklyTotals = weekDates.map(date => dailyTransactions[date] || 0);

    return weeklyTotals;

  } catch (error) {
    console.error("Error fetching user daily transactions data: ", error);
    return [];
  }
};
