import React, { useState } from "react";
import {
  Typography,
  Alert,
  Card,
  CardHeader,
  CardBody,
  Dialog,
  Button,
  DialogHeader,
  DialogFooter,
  DialogBody,
  Select,
  Option,
  Input,
  Textarea,
} from "@material-tailwind/react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Navigate, useNavigate } from "react-router-dom";
import { useUser } from "@/context/AuthContext";
import { FirebaseFirestore } from "@/firebase";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";

export function SkProfiling() {
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

  const { user } = useUser();

  const handleInputChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const [showDialog, setShowDialog] = React.useState(true); // State to control dialog visibility
  const alerts = ["gray", "green", "orange", "red"];
  const navigate = useNavigate();
  const moveRequest = () => {
    navigate(`/userdashboard/home`);
  };

  const [formValues, setFormValues] = React.useState({
    education: "",
    workStatus: "",
    registeredSk: "",
    registeredNational: "",
    voted: "",
    votedYear: "",
    attended: "",
    member: "",
    willing: "",
    hobbies: "",
    recommended: "",
    policy: "",
  });

  const handleSelectChange = (val, name) => {
    setFormValues({ ...formValues, [name]: val }); // Use [name] to dynamically set the key
    console.log(val);
    console.log(name);
  };

  const cardData = [
    {
      title: "Educational Background",
      type: "select",
      name: "education",
      options: [
        "Elementary",
        "Junior High School",
        "Senior High School",
        "College Level",
        "College Graduate",
        "Masters Level",
        "Masters Graduate",
        "Doctorate Level",
        "Doctorate Graduate",
        "Post Graduate",
      ],
    },
    {
      title: "Work Status",
      type: "select",
      name: "workStatus",
      options: [
        "Not interested looking for a job",
        "Unemployed",
        "Employed",
        "Self-Employed",
        "Actively  looking for a job",
      ],
    },
    {
      title: "Are you a registered SK voter?",
      type: "select",
      name: "registeredSk",
      options: ["Yes", "No"],
    },
    {
      title: "Are you a registered national voter?",
      type: "select",
      name: "registeredNational",
      options: ["Yes", "No"],
    },
    {
      title: "Voted last election?",
      type: "select",
      name: "voted",
      options: ["Yes", "No"],
    },
    {
      title: "If Yes, what year did you vote? ex. 2023",
      type: "input",
      name: "votedYear",
    },
    {
      title:
        "Have you already attended a KK Assembly? If yes, how many times? If no, why?",
      type: "select",
      name: "attended",
      options: [
        "1-2 times",
        "3-4 times",
        "5 and above",
        "There was no KK Assembly",
        "Not interested to attend",
        "I don't know what KK Assembly is",
      ],
    },
    {
      title: "Are you a member of any youth-led organization?",
      type: "select",
      name: "member",
      options: ["Yes", "No"],
    },
    {
      title:
        "Are you willing to be engaged and be a member of a youth organization and be a youth volunteer in different activities of Sangguniang Kabataan?",
      type: "select",
      name: "willing",
      options: ["Yes", "No"],
    },
    {
      title: "What are your interests and hobbies?",
      type: "input",
      name: "hobbies",
    },
    {
      title:
        "Ano-anung programa, proyekto, o aktibidad ang nais mong maisakatuparan ng Sangguniang Kabataan ng Barangay Muzon Proper?  Ilagay ang N/A kung walang nais na ma-i-rekomenda. (Recommended Projects, Programs, and Activities)",
      type: "text",
      name: "recommended",
    },
    {
      title:
        "Ano-anung polisiya pangkabataan ang nais mong maisakatuparan ng Sangguniang Kabataan ng Barangay Muzon Proper? Ilagay ang N/A kung walang nais na ma-i-rekomenda.",
      type: "text",
      name: "policy",
    },
  ];

  React.useEffect(() => {
    // Show the dialog when the component mounts
    setShowDialog(true);
  }, []);
  const handleOpen = () => setShowDialog(!open);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userRef = doc(FirebaseFirestore, "users", user.uid);

      await updateDoc(userRef, {
        verified: true,
        profiling: {
          timestamp: serverTimestamp(),
          education: formValues.education,
          workStatus: formValues.workStatus,
          registeredSk: formValues.registeredSk,
          registeredNational: formValues.registeredNational,
          voted: formValues.voted,
          votedYear: formValues.votedYear,
          attended: formValues.attended,
          member: formValues.member,
          willing: formValues.willing,
          hobbies: formValues.hobbies,
          recommended: formValues.recommended,
          policy: formValues.policy,
        },
      });

      navigate(`/userdashboard/home`);
    } catch (e) {
      alert(e.message);
    }
  };
  return (
    <div className="mx-auto my-20 flex max-w-screen-md flex-col gap-8">
      {/* Dialog Component */}
      <Dialog open={showDialog} handler={handleOpen}>
        <DialogHeader> YOUTH PROFILE - BRGY. MUZON PROPER</DialogHeader>
        <DialogBody className="h-[30rem] overflow-y-scroll">
          <Typography className="font-normal">
            <strong>1. Purpose of the Study:</strong> The Profiling aims to
            gather the information and data of the Katipunan ng Kabataan
            members. The information that will be gathered in the KK Profiling
            will be stored in the upcoming SK Portal and will only be used for
            the purpose of database management handled by the National Youth
            Commission.
            <br />
            <br />
            <strong>2. Terms and Duration of Participation:</strong> You are
            asked to join the study as a participant in the KK Profiling. The
            conduct of the profiling will take 2 to 3 hours per Barangay; the
            data will serve as an updated National database of the Katipunan ng
            Kabataan members in the Philippines.
            <br /> <br />
            <strong>3. Risks/Confidentiality:</strong> Your participation in the
            study will be treated with utmost confidentiality. Any information
            collected from you will be used in the Database management. Also,
            your safety is our primary concern. The profiling ensures that there
            will be no risk encountered during the process of data collection.
            <br /> <br />
            <strong>4. Compensation:</strong> The activity is in accordance with
            RA No. 10742 and the policy/guidelines of the Department of Interior
            and Local Government and the National Youth Commission. There will
            be no monetary remuneration other than our sincerest gratitude for
            your time and effort. Your participation will be highly appreciated.
            <br /> <br />
            <strong>5. Inquiries:</strong> If you have any questions regarding
            the administration of the survey or the study in general, please do
            not hesitate to contact the Sangguniang Kabataan of Barangay Muzon
            Proper. Facebook - Sangguniang Kabataan Muzon Proper 2023
            <hr className="my-4 border"></hr>
            <strong>
              I hereby confirm my participation in this data gathering conducted
              by the Office of the Sangguniang Kabataan of Barangay Muzon Proper
              and I am willing to provide my personal data and perspectives
              which will be the basis of the said SK in crafting their projects,
              programs, and activities.
            </strong>{" "}
          </Typography>
        </DialogBody>
        <DialogFooter className="space-x-2">
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => moveRequest()}
          >
            cancel
          </Button>
          <Button variant="gradient" color="green" onClick={handleOpen}>
            confirm
          </Button>
        </DialogFooter>
      </Dialog>

      <form onSubmit={handleSubmit}>
        {cardData.map((card, index) => (
          <Card
            key={index}
            className="my-3 border border-blue-gray-100 shadow-sm"
          >
            <CardHeader
              color="transparent"
              floated={false}
              shadow={false}
              className="m-0 p-0 px-4 pt-4 "
            >
              <Typography variant="h6" color="blue-gray text-sm font-normal">
                {card.title}
              </Typography>
            </CardHeader>
            <CardBody className="flex flex-col p-4">
              <div className="grid grid-cols-1 ">
                {card.type === "input" ? (
                  <Input
                    size="lg"
                    name={card.name}
                    onChange={handleInputChange}
                    type="text"
                    className=" !border-t-blue-gray-200  focus:!border-t-gray-900"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                  />
                ) : card.type === "select" ? (
                  <Select
                    name={card.name}
                    value={formValues[card.name] || ""}
                    onChange={(val) => handleSelectChange(val, card.name)}
                    labelProps={{
                      className: "before:mr-0 after:ml-0",
                    }}
                  >
                    {card.options.map((option, optionIndex) => (
                      <Option key={optionIndex} value={option}>
                        {option}
                      </Option>
                    ))}
                  </Select>
                ) : (
                  <Textarea
                    size="lg"
                    name={card.name}
                    onChange={handleInputChange}
                    type="text"
                    className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                  />
                )}
              </div>
            </CardBody>
          </Card>
        ))}

        <div className=" md:row-reverse  flex">
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </div>
  );
}

export default SkProfiling;
