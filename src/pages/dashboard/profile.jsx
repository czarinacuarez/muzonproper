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
} from "@material-tailwind/react";
import {
  HomeIcon,
  ChatBubbleLeftEllipsisIcon,
  Cog6ToothIcon,
  PencilIcon,
} from "@heroicons/react/24/solid";
import { Link, useParams } from "react-router-dom";
import { ProfileInfoCard, MessageCard } from "@/widgets/cards";
import { platformSettingsData, conversationsData, projectsData } from "@/data";
import { FirebaseFirestore } from "@/firebase";
import { onSnapshot, doc } from "firebase/firestore";
import { useState, useEffect } from "react";
export function Profile() {
  const { id } = useParams(); // Get the `id` from the route parameter
  const [user, setUser] = useState(null);

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
    const docRef = doc(FirebaseFirestore, "users", id); // Reference to the user document by ID

    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setUser(docSnapshot.data()); // Set user data in state
      } else {
        console.log("No such document!");
      }
    });

    return () => unsubscribe(); // Clean up the listener on component unmount
  }, [id]);

  return (
    <>
      <div className="relative mt-8 h-72 w-full overflow-hidden rounded-xl bg-[url('/img/greenpattern22.png')] bg-cover	bg-center">
        <div className="absolute inset-0 h-full w-full " />
      </div>
      {user ? (
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
                    {user ? `${user.firstname} ${user.lastname}` : "Loading..."}
                  </Typography>
                  <Typography
                    variant="small"
                    className="font-normal text-blue-gray-600"
                  >
                    {user ? user.email : "Loading..."}
                  </Typography>
                </div>
              </div>
              <div className="flex w-full items-center justify-center md:w-max md:px-3">
                <Tooltip
                  content={
                    user
                      ? user.verified
                        ? "Verified"
                        : "User need to answer SK Profiling"
                      : "Loading..."
                  }
                >
                  <Chip
                    value={
                      user
                        ? user.verified
                          ? "Verified"
                          : "Not Verified"
                        : "Loading..."
                    }
                    color={user ? (user.verified ? "green" : "red") : "default"}
                  />
                </Tooltip>
              </div>
            </div>
            <div className="gird-cols-1 mb-2 grid px-4 md:gap-12 lg:grid-cols-2 xl:grid-cols-3">
              <ProfileInfoCard
                title="Profile Information"
                details={{
                  mobile: user ? user.phone : "Loading...",
                  gender: user ? user.gender : "Loading...",
                  "civil status": user ? user.civilStatus : "Loading...",
                  location: user
                    ? `${convertToTitleCase(user.area)}, ${user.barangay}, ${
                        user.city
                      }, ${user.province}, Region ${user.region} `
                    : "Loading...",
                  youth: convertToTitleCase(user.youth),
                  "Age Group": user
                    ? convertToTitleCase(user.ageGroup)
                    : "Loading...",
                }}
              />

              {user && user.verified && (
                <div>
                  <hr className="my-8 border-blue-gray-50 md:hidden" />

                  <Typography variant="h5" color="green" className="mb-3">
                    SK Profiling
                  </Typography>
                  {Object.entries({
                    "Educational Background": user.profiling.education,
                    "Work Status": user.profiling.workStatus,
                    "Are you a registered SK voter?":
                      user.profiling.registeredSk,
                    "Are you a registered national voter?":
                      user.profiling.registeredNational,
                    "Voted Last Election?": user.profiling.voted,
                    "If yes, what year did you vote?": user.profiling.votedYear,
                    "Have you already attended a KK Assembly? If yes, how many times? If no, why?":
                      user.profiling.attended,
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
              {user && user.verified && (
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-3">
                    {"   "}
                  </Typography>
                  {Object.entries({
                    "Are you a member of any youth-led organization?":
                      user.profiling.member,
                    "Are you willing to be engaged and be a member of a youth organization and be a youth volunteer in different activities of Sangguniang Kabataan?":
                      user.profiling.willing,
                    "Interests and Hobbies (check all that applies)":
                      user.profiling.hobbies,
                    "Ano-anung programa, proyekto, o aktibidad ang nais mong maisakatuparan ng Sangguniang Kabataan ng Barangay Muzon Proper?  Ilagay ang N/A kung walang nais na ma-i-rekomenda.":
                      user.profiling.recommended,
                    "Ano-anung polisiya pangkabataan ang nais mong maisakatuparan ng Sangguniang Kabataan ng Barangay Muzon Proper? Ilagay ang N/A kung walang nais na ma-i-rekomenda.":
                      user.profiling.policy,
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

export default Profile;
