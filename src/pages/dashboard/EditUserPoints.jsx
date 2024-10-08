import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import {
  PlusIcon,
} from "@heroicons/react/24/solid";
import {
  Card,
  CardHeader,
  Input,
  Typography,
  CardBody,
  Tooltip,
  IconButton,
  Dialog,
  Button,
  CardFooter,
} from "@material-tailwind/react";
import { collection, onSnapshot, getDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import { FirebaseFirestore } from "@/firebase";
import { useState, useEffect } from "react";

const TABS = [
  {
    label: "All",
    value: "all",
  },
];

const TABLE_HEAD = ["User Name", "Points", "Updated At", ""];

export function EditUserPoints() {
    const [userId, setUserId] = useState(null);

    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen((cur) => !cur);

    const [userPointsData, setUserPointsData] = useState([]);
    const [searchQuery, setSearchQuery] = useState(""); // State for search query

    const [bigBottles, setBigBottles] = useState(0);
    const [smallBottles, setSmallBottles] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);

    const handleBigBottlesChange = (e) => {
        const value = parseInt(e.target.value) || 0; 
        setBigBottles(value);
        calculatePoints(value, smallBottles);
    };

    const handleSmallBottlesChange = (e) => {
        const value = parseInt(e.target.value) || 0; 
        setSmallBottles(value);
        calculatePoints(bigBottles, value);
    };

    const calculatePoints = (big, small) => {
        const points = big * 5 + small * 3;
        setTotalPoints(points);
    };

    useEffect(() => {
        const fetchUserPointsData = async () => {
        const userPointsCollection = collection(FirebaseFirestore, "userPoints");
        const unsubscribe = onSnapshot(userPointsCollection, async (snapshot) => {
            const pointsData = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
            }));

            // Fetch user details for each user_points_id in userPoints
            const updatedPointsData = await Promise.all(pointsData.map(async (pointData) => {
            const userDoc = await getDoc(doc(FirebaseFirestore, "users", pointData.user_points_id));
            const userData = userDoc.exists() ? userDoc.data() : { firstname: "", lastname: "" };
            return {
                ...pointData,
                firstname: userData.firstname,
                lastname: userData.lastname,
            };
            }));

            setUserPointsData(updatedPointsData);
            console.log(updatedPointsData);
        });

        return () => unsubscribe();
        };

        fetchUserPointsData();
    }, []);

    // Function to handle search logic
    const filteredUserPoints = userPointsData.filter((pointData) => {
        const userName = `${pointData.firstname} ${pointData.lastname}`.toLowerCase(); // Combine first and last names
        const searchLowerCase = searchQuery.toLowerCase();

        return userName.includes(searchLowerCase);
    });

    const handleAddPoints = async () => {
        const timestamp = new Date();
        const pointsData = {
            action: "points added",
            bigBottles,
            smallBottles,
            totalBottles: bigBottles + smallBottles,
            points: totalPoints,
            userId: userId,
            timestamp: timestamp,
        };
    
        try {
            await addDoc(collection(FirebaseFirestore, "pointsAddedHistory"), pointsData);
            const userDocRef = doc(FirebaseFirestore, "userPoints", userId); // Assuming userId is the document ID
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                const currentPoints = userDoc.data().points || 0; // Get current points, default to 0 if undefined
                await updateDoc(userDocRef, {
                    points: currentPoints + totalPoints, // Update with new total
                    updatedAt: timestamp, // Update timestamp
                });
            } else {
                console.log("No such user document!");
            }

            setBigBottles(0);
            setSmallBottles(0);
            setTotalPoints(0);
            setUserId(null);
            handleOpen(); 
        } catch (error) {
            console.error("Error adding points: ", error);
        }
    };
    
    return (
        <>
            <Dialog
                size="xs"
                open={open}
                handler={handleOpen}
                className="bg-transparent shadow-none"
            >
            <Card className="mx-auto w-full max-w-[24rem]">
                <CardBody className="flex flex-col gap-4">
                    <Typography variant="h4" color="blue-gray">
                        Add Points
                    </Typography>
                    <Typography
                        className="mb-3 font-normal"
                        variant="paragraph"
                        color="gray"
                        >
                        Add user points.
                    </Typography>
                    <Typography className="-mb-2" variant="h6">
                        Big Bottles
                    </Typography>
                    <Input label="Amount" size="lg" type="number" onChange={handleBigBottlesChange}/>
                    <Typography className="-mb-2" variant="h6">
                        Small Bottles
                    </Typography>
                    <Input label="Amount" size="lg" type="number" onChange={handleSmallBottlesChange}/>
                    <Typography className="-mb-2" variant="h6">
                        Total Bottles
                    </Typography>
                    <Input label="Total" size="lg" type="number" value={bigBottles + smallBottles}  readOnly/>
                    <Typography className="-mb-2" variant="h6">
                        Points
                    </Typography>
                    <Input label="Points" size="lg" type="number" value={totalPoints} readOnly/>
                    <div className="flex justify-end">
                        <Button onClick={handleAddPoints}>Add Points</Button>
                    </div>
                </CardBody>
            </Card>
        </Dialog>

        <div className="mx-auto my-14 flex max-w-screen-xl flex-col gap-8">
            <Card className="h-full w-full border border-blue-gray-100 shadow-sm">
                <CardHeader floated={false} shadow={false} className="rounded-none">
                    <div className="mb-8 flex items-center justify-between gap-8">
                        <div>
                        <Typography variant="h5" color="green">
                            User Points List
                        </Typography>
                        <Typography color="gray" className="mt-1 font-normal">
                            See information about user points and their update timestamps here.
                        </Typography>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <div className="md:col-span-2">
                        <Input
                            label="Search"
                            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)} // Update search query
                        />
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
                        {filteredUserPoints.map((pointData, index) => {
                            const isLast = index === filteredUserPoints.length - 1;
                            const classes = isLast
                            ? "p-4"
                            : "p-4 border-b border-blue-gray-50";

                            const userName = `${pointData.firstname} ${pointData.lastname}`; // Combine first and last names

                            return (
                            <tr key={pointData.id}>
                                <td className={classes}>
                                <Typography variant="small" color="blue-gray" className="font-semibold">
                                    {userName} {/* Display user name */}
                                </Typography>
                                </td>
                                <td className={classes}>
                                <Typography variant="small" color="blue-gray" className="font-semibold">
                                    {pointData.points}
                                </Typography>
                                </td>
                                <td className={classes}>
                                <Typography variant="small" color="blue-gray" className="font-normal">
                                    {pointData.updatedAt ? pointData.updatedAt.toDate().toLocaleString() : "N/A"}
                                </Typography>
                                </td>
                                <td className={classes}>
                                <Tooltip content="Edit Points">
                                    <IconButton variant="text" onClick={() => {
                                        setUserId(pointData.id); // Set the user ID when clicked
                                        handleOpen();
                                    }}>
                                    <PlusIcon className="h-4 w-4"/>
                                    </IconButton>
                                </Tooltip>
                                </td>
                            </tr>
                            );
                        })}
                    </tbody>
                </table>
                </CardBody>
            </Card>
        </div>
        </>
    );
}

export default EditUserPoints;
