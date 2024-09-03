import React from "react";
import { PencilIcon } from "@heroicons/react/24/solid";
import {
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  Card,
  CardHeader,
  Typography,
  Button,
  CardBody,
  Chip,
  CardFooter,
  Avatar,
  IconButton,
  Tooltip,
  Input,
} from "@material-tailwind/react";
import { useUser } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import {
  doc,
  getDocs,
  collection,
  query,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { FirebaseFirestore } from "@/firebase";
import { useNavigate } from "react-router-dom";
const TABLE_HEAD = [
  "User",
  "Document Name",
  "Deadline",
  "Date",
  "Status",
  "Actions",
];

export function Transactions() {
  const { user } = useUser();
  const [requests, setRequests] = useState([]);

  const [showAlerts, setShowAlerts] = React.useState({
    blue: true,
    green: true,
    orange: true,
    red: true,
  });
  const [showAlertsWithIcon, setShowAlertsWithIcon] = React.useState({
    blue: true,
    green: true,
    orange: true,
    red: true,
  });
  const alerts = ["gray", "green", "orange", "red"];
  const truncate = (str, max) =>
    str.length > max ? `${str.slice(0, max)}...` : str;

  const [users, setUsers] = useState([]);
  const [requestsWithUsers, setRequestsWithUsers] = useState([]);
  const [error, setError] = useState(null);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    const requestsCollection = query(
      collection(FirebaseFirestore, "requests"),
      orderBy("submissionDate", "desc"),
    );

    const usersCollection = collection(FirebaseFirestore, "users");

    const unsubscribeRequests = onSnapshot(
      requestsCollection,
      (snapshot) => {
        const requestsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRequests(requestsData);
      },
      (error) => {
        console.error("Error fetching requests:", error);
        setError("Failed to fetch requests");
      },
    );

    const unsubscribeUsers = onSnapshot(
      usersCollection,
      (snapshot) => {
        const usersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          firstName: doc.data().firstname,
          lastName: doc.data().lastname,
          imageUrl: doc.data().imageUrl,
        }));
        setUsers(usersData);
      },
      (error) => {
        console.error("Error fetching users:", error);
        setError("Failed to fetch users");
      },
    );

    // Cleanup function to unsubscribe from the real-time listeners
    return () => {
      unsubscribeRequests();
      unsubscribeUsers();
    };
  }, []);

  const navigate = useNavigate();

  const moveRequest = (id) => {
    console.log(id);
    navigate(`/dashboard/request/${id}`);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Loading...";

    const date = new Date(timestamp.toDate()); // Convert Firestore Timestamp to JavaScript Date
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };

    return date.toLocaleString("en-US", options);
  };

  useEffect(() => {
    const combineRequestsWithUsers = () => {
      // Create a map of user IDs to full names and image URLs
      const userMap = users.reduce((map, user) => {
        map[user.id] = {
          name: `${user.firstName} ${user.lastName}`,
          imageUrl: user.imageUrl, // Ensure this is correctly included
        };
        return map;
      }, {});

      // Combine requests with user names and images
      const requestsWithUserInfo = requests.map((request) => ({
        ...request,
        userName: userMap[request.user_id]?.name || "Unknown User",
        userImage: userMap[request.user_id]?.imageUrl || "default_image_url", // Provide a default image URL if necessary
      }));

      setRequestsWithUsers(requestsWithUserInfo);
      setFilteredRequests(requestsWithUserInfo);
    };

    if (users.length > 0 && requests.length > 0) {
      combineRequestsWithUsers();
    }
  }, [users, requests]);

  useEffect(() => {
    const filterRequests = () => {
      if (!searchQuery) {
        setFilteredRequests(requestsWithUsers);
        return;
      }

      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = requestsWithUsers.filter((request) => {
        console.log(request.userName);
        const userName = request.userName ? request.userName.toLowerCase() : "";
        const documentName = request.document_name
          ? request.document_name.toLowerCase()
          : "";
        const userNameMatch = userName.includes(lowerCaseQuery);
        const documentNameMatch = documentName.includes(lowerCaseQuery);

        // Debugging logs
        console.log("Request:", request);
        console.log(
          "User Name:",
          userName,
          "Search Query:",
          lowerCaseQuery,
          "User Name Match:",
          userNameMatch,
        );
        console.log(
          "Document Name:",
          documentName,
          "Search Query:",
          lowerCaseQuery,
          "Document Name Match:",
          documentNameMatch,
        );

        return userNameMatch || documentNameMatch;
      });

      console.log("Filtered Requests:", filtered); // Log the filtered results

      setFilteredRequests(filtered);
    };

    filterRequests();
  }, [searchQuery, requestsWithUsers]);

  return (
    <div className="mx-auto my-14 flex max-w-screen-xl flex-col gap-8">
      <Card className="h-full w-full">
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div>
              <Typography variant="h5" color="blue-gray">
                Print Rewards Request
              </Typography>
              <Typography color="gray" className="mt-1 font-normal">
                These are the details regarding with user's printed paper
                rewards redeeming request.
              </Typography>
            </div>
            <div className="grid w-full shrink-0 grid-cols-1 gap-2 md:flex md:w-max">
              <div className="w-full md:w-72">
                <Input
                  label="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                />
              </div>
              <Button className="flex w-2/5 items-center gap-3" size="sm">
                <ArrowDownTrayIcon strokeWidth={2} className="h-4 w-4" />{" "}
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody className=" overflow-x-auto px-0">
          <table className="w-full min-w-max table-auto text-left">
            <thead>
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th
                    key={head}
                    className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                  >
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal leading-none opacity-70"
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request, index) => {
                const isLast = index === filteredRequests.length - 1;
                const classes = isLast
                  ? "p-4"
                  : "p-4 border-b border-blue-gray-50";

                return (
                  <tr key={request.id}>
                    <td className={classes}>
                      <div className="flex items-center gap-3">
                        {/* Ensure userImage is available if needed */}
                        <Avatar
                          src="/images/unknown.jpg"
                          alt={request.userName}
                          size="md"
                          className="border border-blue-gray-50 bg-blue-gray-50/50 object-contain p-1"
                        />
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-bold"
                        >
                          {truncate(request.userName)}
                        </Typography>
                      </div>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {truncate(request.document_name, 20)}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {formatTimestamp(request.deadline)}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {formatTimestamp(request.submissionDate)}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <div className="w-max">
                        <Chip
                          size="sm"
                          variant="ghost"
                          value={request.status}
                          color={
                            request.status === "received"
                              ? "green"
                              : request.status === "cancelled"
                              ? "red"
                              : request.status === "rejected"
                              ? "red"
                              : "amber"
                          }
                        />
                      </div>
                    </td>
                    <td className={classes}>
                      <Tooltip content="View Request">
                        <IconButton
                          variant="text"
                          onClick={() => moveRequest(request.id)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
        <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
          <Button variant="outlined" size="sm">
            Previous
          </Button>

          <Button variant="outlined" size="sm">
            Next
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Transactions;
