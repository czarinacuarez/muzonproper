import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Avatar,
  Typography,
  Tabs,
  TabsHeader,
  Tab,
  Switch,
  Tooltip,
  Button,
  Chip,
  IconButton,
} from "@material-tailwind/react";
import {
  HomeIcon,
  ChatBubbleLeftEllipsisIcon,
  Cog6ToothIcon,
  PencilIcon,
  EyeIcon,
} from "@heroicons/react/24/solid";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ProfileInfoCard, MessageCard } from "@/widgets/cards";
import { platformSettingsData, conversationsData, projectsData } from "@/data";
import { FirebaseFirestore } from "@/firebase";
import { onSnapshot, doc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useUser } from "@/context/AuthContext";
export function UserProfile() {
  const navigate = useNavigate();
  const moveAccount = () => {
    navigate(`/userdashboard/account`);
  };

  const [users, setUser] = useState(null);
  const { user } = useUser();
  function convertToTitleCase(text) {
    if (!text || text == "") {
      return text; // Return the original text if it's null, undefined, or an empty string
    }
    return text
      .split("-") // Split the string by hyphens
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
      .join(" "); // Join the words with spaces
  }

  useEffect(() => {
    const docRef = doc(FirebaseFirestore, "users", user.uid); // Reference to the users document by ID

    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setUser(docSnapshot.data()); // Set users data in state
      } else {
        console.log("No such document!");
      }
    });

    return () => unsubscribe(); // Clean up the listener on component unmount
  }, [user.uid]);

  return (
    <>
      <div className="relative mt-8 h-72 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover	bg-center">
        <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
      </div>
      {users ? (
        <Card className="mx-3 -mt-16 mb-6 border border-blue-gray-100 lg:mx-4">
          <CardBody className="p-4">
            <div className="mb-10 flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <Avatar
                  src="/images/unknown.jpg"
                  alt="bruce-mars"
                  size="xl"
                  variant="rounded"
                  className="rounded-lg shadow-lg shadow-blue-gray-500/40"
                />
                <div>
                  <Typography variant="h5" color="blue-gray" className="mb-1">
                    {users
                      ? `${users.firstname} ${users.lastname}`
                      : "Loading..."}
                  </Typography>
                  <Typography
                    variant="small"
                    className="font-normal text-blue-gray-600"
                  >
                    {users ? users.email : "Loading..."}
                  </Typography>
                </div>
              </div>
              <div className="flex w-full items-center justify-center gap-3 md:w-max md:px-3">
                <Tooltip
                  content={
                    users
                      ? users.verified
                        ? "Verified"
                        : "User need to answer SK Profiling"
                      : "Loading..."
                  }
                >
                  <Chip
                    value={
                      users
                        ? users.verified
                          ? "Verified"
                          : "Not Verified"
                        : "Loading..."
                    }
                    color={
                      users ? (users.verified ? "green" : "red") : "default"
                    }
                  />
                </Tooltip>
              </div>
            </div>
            <div className="gird-cols-1 mb-2 grid px-4 md:gap-12 lg:grid-cols-2 xl:grid-cols-3">
              <ProfileInfoCard
                title="Profile Information"
                action={
                  <Tooltip content="Edit Profile">
                    <PencilIcon
                      onClick={() => moveAccount()}
                      className="h-4 w-4 cursor-pointer text-blue-gray-500"
                    />
                  </Tooltip>
                }
                details={{
                  mobile: users ? users.phone : "Loading...",
                  gender: users ? users.gender : "Loading...",
                  "civil status": users ? users.civilStatus : "Loading...",
                  location: users
                    ? `${convertToTitleCase(users.area)}, ${users.barangay}, ${
                        users.city
                      }, ${users.province}, Region ${users.region} `
                    : "Loading...",
                  youth: convertToTitleCase(users.youth),
                  "Age Group": users
                    ? convertToTitleCase(users.ageGroup)
                    : "Loading...",
                }}
              />

              {users && users.verified && (
                <div>
                  <hr className="my-8 border-blue-gray-50 md:hidden" />

                  <Typography variant="h6" color="blue-gray" className="mb-3">
                    SK Profiling
                  </Typography>
                  {Object.entries({
                    "Educational Background": users.profiling.education,
                    "Work Status": users.profiling.workStatus,
                    "Are you a registered SK voter?":
                      users.profiling.registeredSk,
                    "Are you a registered national voter?":
                      users.profiling.registeredNational,
                    "Voted Last Election?": users.profiling.voted,
                    "If yes, what year did you vote?":
                      users.profiling.votedYear,
                    "Have you already attended a KK Assembly? If yes, how many times? If no, why?":
                      users.profiling.attended,
                  }).map(([description, title], index) => (
                    <div className="my-4 flex items-center gap-4" key={index}>
                      <div>
                        <Typography className="text-xs font-normal text-blue-gray-400">
                          {description}
                        </Typography>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="mb-1 font-semibold"
                        >
                          {title}
                        </Typography>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {users && users.verified && (
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-3">
                    {"   "}
                  </Typography>
                  {Object.entries({
                    "Are you a member of any youth-led organization?":
                      users.profiling.member,
                    "Are you willing to be engaged and be a member of a youth organization and be a youth volunteer in different activities of Sangguniang Kabataan?":
                      users.profiling.willing,
                    "Interests and Hobbies (check all that applies)":
                      users.profiling.hobbies,
                    "Ano-anung programa, proyekto, o aktibidad ang nais mong maisakatuparan ng Sangguniang Kabataan ng Barangay Muzon Proper?  Ilagay ang N/A kung walang nais na ma-i-rekomenda.":
                      users.profiling.recommended,
                    "Ano-anung polisiya pangkabataan ang nais mong maisakatuparan ng Sangguniang Kabataan ng Barangay Muzon Proper? Ilagay ang N/A kung walang nais na ma-i-rekomenda.":
                      users.profiling.policy,
                  }).map(([description, title], index) => (
                    <div className="my-4 flex items-center gap-4" key={index}>
                      <div>
                        <Typography className="text-xs font-normal text-blue-gray-400">
                          {description}
                        </Typography>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="mb-1 font-semibold"
                        >
                          {title}
                        </Typography>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
}

export default UserProfile;
