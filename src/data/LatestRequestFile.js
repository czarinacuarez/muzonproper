import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";

const firestore = getFirestore();

const fetchUserDetails = async (userId) => {
  try {
    const userDoc = await getDoc(doc(firestore, "users", userId));
    return userDoc.data() || { firstname: "Unknown", lastname: "Unknown" };
  } catch (error) {
    console.error("Error fetching user details: ", error);
    return { firstname: "Unknown", lastname: "Unknown" };
  }
};

const fetchLatestRequests = async () => {
  const latestRequests = [];

  try {
    const requestsQuery = query(
      collection(firestore, "requests"),
      orderBy("submissionDate", "desc"),
      limit(5),
    );
    const querySnapshot = await getDocs(requestsQuery);

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const deadline = data.deadline
        ? new Date(data.deadline.seconds * 1000)
        : new Date();
      const userDetails = await fetchUserDetails(data.user_id);

      latestRequests.push({
        firstname: userDetails.firstname || "Unknown",
        lastname: userDetails.lastname || "Unknown",
        document_name: data.document_name || "No name",
        deadline: deadline,
        id: doc.id,
        status: data.status,
      });
    }
  } catch (error) {
    console.error("Error fetching latest requests: ", error);
  }

  return latestRequests;
};

export default fetchLatestRequests;
