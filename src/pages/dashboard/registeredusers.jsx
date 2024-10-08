import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  ArrowDownTrayIcon,
  EyeIcon,
  PencilIcon,
  UserPlusIcon,
} from "@heroicons/react/24/solid";
import * as XLSX from "xlsx"; // Import xlsx for Excel export

import {
  Card,
  CardHeader,
  Input,
  Typography,
  Button,
  CardBody,
  Chip,
  CardFooter,
  Tabs,
  TabsHeader,
  Tab,
  Avatar,
  IconButton,
  Tooltip,
} from "@material-tailwind/react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { collection, onSnapshot } from "firebase/firestore";
import { FirebaseFirestore } from "@/firebase";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const TABS = [
  {
    label: "All",
    value: "all",
  },
];

const TABLE_HEAD = ["User", "Area", "Contact", "Youth", "Verification", ""];

export function RegisteredUsers() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const navigate = useNavigate();

  const exportToExcel = () => {
    const usersToExport = filteredUsers.map((user, index) => ({
      "User No.": index + 1, // Start numbering from 1
      "Last Name": user.lastname || "N/A",
      "First Name": user.firstname || "N/A",
      Verified: user.verified ? "Verified" : "Not Verified", // Conditional logic for verification
      Email: user.email || "N/A",
      "Phone no.": user.phone || "N/A", // Adjust field according to your data
      "Civil Status": user.civilStatus || "N/A",
      Gender: user.gender || "N/A",
      "Age Group": user.ageGroup || "N/A",
      Area: user.area || "N/A",
      Barangay: user.barangay || "N/A",
      City: user.city || "N/A",
      Province: user.province || "N/A",
      Region: user.region || "N/A",
    }));

    console.log(usersToExport); // Ensure usersToExport is correctly populated

    const worksheet = XLSX.utils.json_to_sheet(usersToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registered Users");

    // Attempt to write and download the Excel file
    XLSX.writeFile(workbook, "RegisteredUsers.xlsx");
  };

  const moveRequest = (id) => {
    if (id) {
      navigate(`/dashboard/profile/${id}`);
    } else {
      console.error("User ID is undefined!");
    }
  };

  function convertToTitleCase(text) {
    if (!text || text === "") return text;
    return text
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  const handleClick = () => {
    console.log("Button clicked!");
  };

  useEffect(() => {
    const usersCollection = collection(FirebaseFirestore, "users");
    const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
      const usersData = snapshot.docs
        .map((doc) => ({
          ...doc.data(),
          id: doc.id, // This ensures each user has an `id`
        }))
        .filter((user) => user.type !== "admin");
      setUsers(usersData);
      console.log(usersData);
    });

    return () => unsubscribe();
  }, []);

  // Function to handle the search logic
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
    const email = user.email.toLowerCase();
    const searchLowerCase = searchQuery.toLowerCase();

    return (
      fullName.includes(searchLowerCase) || email.includes(searchLowerCase)
    );
  });

  return (
    <div className="mx-auto my-14 flex max-w-screen-xl flex-col gap-8">
      <Card className="h-full w-full border border-blue-gray-100 shadow-sm">
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="mb-8 flex items-center justify-between gap-8">
            <div>
              <Typography variant="h5" color="green">
                Users List
              </Typography>
              <Typography color="gray" className="mt-1 font-normal">
                See information about all registered users in barangay Muzon
                Proper here.
              </Typography>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <Tabs value="all" className="w-full md:w-max">
              <TabsHeader>
                {TABS.map(({ label, value }) => (
                  <Tab key={value} value={value}>
                    &nbsp;&nbsp;{label}&nbsp;&nbsp;
                  </Tab>
                ))}
              </TabsHeader>
            </Tabs>
            <div className="grid w-max grid-cols-1 gap-2 md:grid-cols-3">
              <div className="md:col-span-2">
                <Input
                  label="Search"
                  icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} // Update search query
                />
              </div>
              <Button
                onClick={exportToExcel}
                color="green"
                className="flex w-full items-center gap-3"
                size="sm"
              >
                <ArrowDownTrayIcon strokeWidth={2} className="h-4 w-4" />{" "}
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="max-h-96 overflow-auto px-0">
          <table className="mt-4 w-full min-w-max table-auto text-left">
            <thead>
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th
                    key={head}
                    className="border-b border-blue-gray-50 px-5 py-3 text-left"
                  >
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="text-[11px] font-bold uppercase text-blue-gray-400"
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => {
                const isLast = index === filteredUsers.length - 1;
                const classes = isLast
                  ? "p-4"
                  : "p-4 border-b border-blue-gray-50";

                return (
                  <tr key={user.id}>
                    <td className={classes}>
                      <div className="flex items-center gap-4">
                        <Avatar
                          src="/images/unknown.jpg"
                          size="sm"
                          variant="rounded"
                        />
                        <div className="flex flex-col">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-semibold"
                          >
                            {user.firstname} {user.lastname}
                          </Typography>
                          <Typography className="text-xs font-normal text-blue-gray-500">
                            {user.email}
                          </Typography>
                        </div>
                      </div>
                    </td>
                    <td className={classes}>
                      <div className="flex flex-col">
                        <Typography className="text-sm font-semibold text-blue-gray-600">
                          {`${convertToTitleCase(
                            user.area,
                          )}, ${convertToTitleCase(user.barangay)}`}
                        </Typography>
                        <Typography className="text-xs font-normal text-blue-gray-500">
                          {`${user.city}, ${user.province}`}
                        </Typography>
                      </div>
                    </td>
                    <td className={classes}>
                      <Typography className="text-sm font-normal text-blue-gray-600">
                        {user.phone}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography className="text-sm font-normal text-blue-gray-600">
                        {convertToTitleCase(user.youth)}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <div className="w-max">
                        <Chip
                          variant="ghost"
                          size="sm"
                          value={user.verified ? "Verified" : "Not Verified"}
                          color={user.verified ? "green" : "red"}
                        />
                      </div>
                    </td>

                    <td className={classes}>
                      <Tooltip content="View User">
                        <IconButton
                          onClick={() => moveRequest(user.id)}
                          variant="text"
                        >
                          <EyeIcon className="h-4 w-4" />
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
          {/* <Typography variant="small" color="blue-gray" className="font-normal">
            Page 1 of 10
          </Typography>
          <div className="flex gap-2">
            <Button variant="outlined" size="sm">
              Previous
            </Button>
            <Button variant="outlined" size="sm">
              Next
            </Button>
          </div> */}
        </CardFooter>
      </Card>
    </div>
  );
}

export default RegisteredUsers;
