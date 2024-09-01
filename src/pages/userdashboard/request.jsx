import React from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Tooltip,
  Progress,
} from "@material-tailwind/react";
import {
  EllipsisVerticalIcon,
  ArrowUpIcon,
  TvIcon,
} from "@heroicons/react/24/outline";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import {
  statisticsCardsData,
  statisticsChartsData,
  projectsTableData,
  ordersOverviewData,
} from "@/data";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/solid";
import { useParams } from "react-router-dom";
import { doc , getDoc} from "firebase/firestore";
import { useState, useEffect } from "react";
import { FirebaseFirestore } from "@/firebase";

export function UserRequest() {
  const {id} = useParams();
  const [orderData, setOrderData] = useState([]);
  
  useEffect(() => {
    console.log(id);
    async function fetchOrder() {
      try {
        const docRef = doc(FirebaseFirestore, 'requests', id); // Reference to the specific document
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          const initialData = {
            icon: TvIcon,
            color: "text-green-300",
            title: "Requested to redeem reward",
            description: data.submissionDate ? formatTimestamp(data.submissionDate) : 'No Description',
          };

          let decisionData = [];
          
          if (data.admin_decision.decision_date !== null) {
            if (data.admin_decision.accepted) {
              decisionData.push({
                icon: CheckCircleIcon, // Icon for acceptance
                color: "text-green-500", // Color for acceptance
                title: "Admin Accepted Your Request",
                description: data.admin_decision.decision_date ? formatTimestamp(data.admin_decision.decision_date) : 'No Decision Date',
              });
            } else if (data.admin_decision.rejected) {
              decisionData.push({
                icon: XCircleIcon, // Icon for rejection
                color: "text-red-500", // Color for rejection
                title: "Admin Rejected Your Request",
                description: data.admin_decision.decision_date ? formatTimestamp(data.admin_decision.decision_date) : 'No Decision Date',
              });
            }
          }

          // Set both initial and decision data
          setOrderData([initialData, ...decisionData]);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document: ", error);
      }
    }
    
    fetchOrder();
  }, [id]);

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp.toDate()); // Convert Firestore timestamp to Date
    return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
  }

  return (
    <div className="mt-12">
    <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2 border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 flex items-center justify-between p-6"
          >
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-1">
                Title
              </Typography>
              <Typography
                variant="small"
                className="flex items-center gap-1 font-normal text-blue-gray-600"
              >
                {/* <CheckCircleIcon strokeWidth={3} className="h-4 w-4 text-blue-gray-200" /> */}
                {/* <strong>30 done</strong> this month */}
              </Typography>
            </div>
            <Menu placement="left-start">
              <MenuHandler>
                <IconButton size="sm" variant="text" color="blue-gray">
                  <EllipsisVerticalIcon
                    strokeWidth={3}
                    fill="currenColor"
                    className="h-6 w-6"
                  />
                </IconButton>
              </MenuHandler>
              <MenuList>
                <MenuItem>Action</MenuItem>
                <MenuItem>Another Action</MenuItem>
                <MenuItem>Something else here</MenuItem>
              </MenuList>
            </Menu>
          </CardHeader>
          <CardBody className=" px-0 pt-0 pb-2">
         
          </CardBody>
        </Card>
        <Card className="border border-blue-gray-100 shadow-sm">
      <CardHeader
        floated={false}
        shadow={false}
        color="transparent"
        className="m-0 p-6"
      >
        <Typography variant="h6" color="blue-gray">
          Request Progress
        </Typography>
      </CardHeader>
      <CardBody className="pt-0">
        {orderData.map(
          ({ icon, color, title, description }, key) => (
            <div key={title} className="flex items-start gap-4 py-3">
              <div
                className={`relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-[''] ${
                  key === orderData.length - 1
                    ? "after:h-0"
                    : "after:h-4/6"
                }`}
              >
                {React.createElement(icon, {
                  className: `!w-5 !h-5 ${color}`,
                })}
              </div>
              <div>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="block font-medium"
                >
                  {title}
                </Typography>
                <Typography
                  as="span"
                  variant="small"
                  className="text-xs font-medium text-blue-gray-500"
                >
                  {description}
                </Typography>
              </div>
            </div>
          )
        )}
      </CardBody>
    </Card>
      </div>
    </div>
  );
}

export default UserRequest;
