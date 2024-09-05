import { getFirestore, collection, getDocs } from "firebase/firestore";
import moment from 'moment-timezone';

const firestore = getFirestore();

export const fetchTransaction = async () => {
  const dailyUsage = [0, 0, 0, 0, 0, 0, 0];

  try {
    const pointsQuery = collection(firestore, "pointsAddedHistory");
    const querySnapshot = await getDocs(pointsQuery);

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const timestamp = data.timestamp.toDate(); 
        const localTime = moment(timestamp).tz('Asia/Manila').toDate(); 
        const dayOfWeek = localTime.getDay();

        dailyUsage[dayOfWeek] += 1;
    });
  } catch (error) {
    console.error("Error fetching machine usage data: ", error);
  }

  return dailyUsage;
};