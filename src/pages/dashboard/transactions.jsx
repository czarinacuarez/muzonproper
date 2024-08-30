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
import { useEffect , useState } from "react";
import { doc, getDocs, collection, query, onSnapshot } from 'firebase/firestore';
import { FirebaseFirestore } from "@/firebase";
const TABLE_HEAD = ["User", "Document Name","Deadline", "Date", "Status", "Actions",];
 
const TABLE_ROWS = [
  {
    img: "https://docs.material-tailwind.com/img/logos/logo-spotify.svg",
    name: "Spotify",
    amount: "$2,500",
    date: "Wed 3:00pm",
    status: "paid",

  },
  {
    img: "https://docs.material-tailwind.com/img/logos/logo-amazon.svg",
    name: "Amazon",
    amount: "$5,000",
    date: "Wed 1:00pm",
    status: "paid",
 
  },
  {
    img: "https://docs.material-tailwind.com/img/logos/logo-pinterest.svg",
    name: "Pinterest",
    amount: "$3,400",
    date: "Mon 7:40pm",
    status: "pending",
 
  },
  {
    img: "https://docs.material-tailwind.com/img/logos/logo-google.svg",
    name: "Google",
    amount: "$1,000",
    date: "Wed 5:00pm",
    status: "paid",

  },
  {
    img: "https://docs.material-tailwind.com/img/logos/logo-netflix.svg",
    name: "netflix",
    amount: "$14,000",
    date: "Wed 3:30am",
    status: "cancelled",
   
  },
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

  const[users, setUsers] = useState([]);
  const [requestsWithUsers, setRequestsWithUsers] = useState([]);
  const [error, setError] = useState(null);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch requests
        const requestsCollection = collection(FirebaseFirestore, 'requests');
        const requestsSnapshot = await getDocs(requestsCollection);
        const requestsData = requestsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRequests(requestsData);
  
        // Fetch users
        const usersCollection = collection(FirebaseFirestore, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          firstName: doc.data().firstname,
          lastName: doc.data().lastname,
          imageUrl: doc.data().imageUrl,
        }));
        setUsers(usersData);
  
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
      }
    };
  
    fetchData();
  }, []);
  

  useEffect(() => {
  const combineRequestsWithUsers = () => {
    // Create a map of user IDs to full names and image URLs
    const userMap = users.reduce((map, user) => {
      map[user.id] = {
        name: `${user.firstName} ${user.lastName}`,
        imageUrl: user.imageUrl // Ensure this is correctly included
      };
      return map;
    }, {});

    // Combine requests with user names and images
    const requestsWithUserInfo = requests.map(request => ({
      ...request,
      userName: userMap[request.user_id]?.name || 'Unknown User',
      userImage: userMap[request.user_id]?.imageUrl || 'default_image_url' // Provide a default image URL if necessary
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
    const filtered = requestsWithUsers.filter(request => {
      console.log(request.userName);
      const userName = request.userName ? request.userName.toLowerCase() : '';
      const documentName = request.document_name ? request.document_name.toLowerCase() : '';
      const userNameMatch = userName.includes(lowerCaseQuery);
      const documentNameMatch = documentName.includes(lowerCaseQuery);

      // Debugging logs
      console.log('Request:', request);
      console.log('User Name:', userName, 'Search Query:', lowerCaseQuery, 'User Name Match:', userNameMatch);
      console.log('Document Name:', documentName, 'Search Query:', lowerCaseQuery, 'Document Name Match:', documentNameMatch);

      return userNameMatch || documentNameMatch;
    });

    console.log('Filtered Requests:', filtered); // Log the filtered results

    setFilteredRequests(filtered);
  };

  filterRequests();
}, [searchQuery, requestsWithUsers]);


  return (
    <div className="mx-auto my-14 flex max-w-screen-lg flex-col gap-8">
      <Card className="h-full w-full">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <Typography variant="h5" color="blue-gray">
              Rewards Request
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              These are the details regarding with user's prize redeeming request.

            </Typography>
          </div>
          <div className="flex w-full shrink-0 gap-2 md:w-max">
            <div className="w-full md:w-72">
              <Input
                label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              />
            </div>
            <Button className="flex items-center gap-3" size="sm">
              <ArrowDownTrayIcon strokeWidth={2} className="h-4 w-4" /> Download
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody className="overflow-scroll px-0">
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
            const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

            return (
              <tr key={request.id}>
                <td className={classes}>
                  <div className="flex items-center gap-3">
                    {/* Ensure userImage is available if needed */}
                    <Avatar
                      src={request.userImage} 
                      alt={request.userName}
                      size="md"
                      className="border border-blue-gray-50 bg-blue-gray-50/50 object-contain p-1"
                    />
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-bold"
                    >
                      {request.userName}
                    </Typography>
                  </div>
                </td>
                <td className={classes}>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {request.document_name}
                  </Typography>
                </td>
                <td className={classes}>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {new Date(request.deadline.seconds * 1000).toLocaleString()}
                  </Typography>
                </td>
                <td className={classes}>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {new Date(request.submissionDate.seconds * 1000).toLocaleString()}
                  </Typography>
                </td>
                <td className={classes}>
                  <div className="w-max">
                    <Chip
                      size="sm"
                      variant="ghost"
                      value={request.status}
                      color={
                        request.status === "accepted"
                          ? "green"
                          : request.status === "pending"
                          ? "amber"
                          : "red"
                      }
                    />
                  </div>
                </td>
                <td className={classes}>
                  <Tooltip content="Edit Request">
                    <IconButton variant="text">
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
