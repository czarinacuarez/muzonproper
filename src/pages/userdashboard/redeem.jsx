import React, { useState, useRef, useEffect } from "react"; // Ensure useRef is imported
import { EyeIcon, GiftTopIcon, PencilIcon } from "@heroicons/react/24/solid";
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
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Textarea,
} from "@material-tailwind/react";
import { useUser } from "../../context/AuthContext";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
  serverTimestamp,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { FirebaseStorage, FirebaseFirestore } from "../../firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
const TABLE_HEAD = ["Document Name", "Deadline", "Date", "Status", "Actions"];

export function Redeem() {
  const { user } = useUser();
  const [open, setOpen] = React.useState(false);
  const [fileName, setFileName] = useState("");
  const [numPages, setNumPages] = useState(null);
  const [file, setFile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const moveRequest = (id) => {
    navigate(`/userdashboard/request/${id}`);
  };

  const filteredRequests = requests.filter((request) =>
    request.document_name.toLowerCase().includes(search.toLowerCase()),
  );
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
    if (!user || !user.uid) return;
    console.log(user.uid);
    const fetchRequests = async () => {
      try {
        const requestsCollection = collection(FirebaseFirestore, "requests");
        const q = query(requestsCollection, where("user_id", "==", user.uid));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const fetchedRequests = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setRequests(fetchedRequests);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    fetchRequests();
  }, [user]);

  const [formValues, setFormValues] = useState({
    deadline: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let formattedValue = value;

    if (name === "deadline") {
      formattedValue = new Date(value);
    }

    setFormValues({
      ...formValues,
      [name]: formattedValue,
    });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file);
      setFileName(file.name);
      await getNumberOfPages(file);
    }
  };
  const getNumberOfPages = async (file) => {
    try {
      const pdfData = await file.arrayBuffer();
      const pdf = await getDocument({ data: pdfData }).promise;
      setNumPages(pdf.numPages);
    } catch (error) {
      console.error("Error loading PDF:", error);
    }
  };
  const handleDownload = async (e) => {
    e.preventDefault();

    try {
      const fileRef = ref(FirebaseStorage, "pdfs/samplee (1).pdf");

      const downloadURL = await getDownloadURL(fileRef);
      console.log("Download URL:", downloadURL);

      // Open the PDF in a new tab
      window.open(downloadURL, "_blank");
    } catch (error) {
      // Handle errors
      console.error("Error downloading file:", error.message);
      alert("Error downloading file: " + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("File:", file);
      console.log("File Size:", file.size);
      console.log("File Type:", file.type);

      const metadata = {
        contentType: "application/pdf",
      };
      const storageRef = ref(FirebaseStorage, `pdfs/${fileName}`);

      console.log("Uploading file...");
      const uploadResult = await uploadBytes(storageRef, file, metadata);
      console.log("Upload Result:", uploadResult);

      console.log("Getting download URL...");
      const downloadURL = await getDownloadURL(storageRef);
      console.log("Download URL:", downloadURL);

      console.log("Adding document to Firestore...");

      const docRef = await addDoc(collection(FirebaseFirestore, "requests"), {
        user_id: user.uid,
        document_name: fileName,
        deadline: formValues.deadline,
        document_url: downloadURL,
        submissionDate: serverTimestamp(),
        status: "pending",
        pages: numPages,
        admin_decision: {
          accepted: false,
          rejected: false,
          decision_date: null,
          comments: "",
          user_received: false,
          user_received_date: null,
          printed: false,
          printed_date: null,
        },
        user_decision: {
          cancelled: false,
          cancelled_date: null,
        },
      });
      setNumPages(null);

      const docId = docRef.id;
      const newMapId = doc(collection(FirebaseFirestore, "_")).id;
      const notificationRef = doc(FirebaseFirestore, "notifications", "admin");
      const docSnapshot = await getDoc(notificationRef);

      if (!docSnapshot.exists()) {
        await setDoc(notificationRef, {
          [`notification-${newMapId}`]: {
            request: true,
            cancelled: false,
            transactionId: docId,
            timestamp: serverTimestamp(),
            user_id: user.uid,
            viewed: false,
          },
        });
        console.log("Created new document for admin notifications");
      } else {
        await updateDoc(notificationRef, {
          [`notification-${newMapId}`]: {
            request: true,
            cancelled: false,
            transactionId: docId,
            timestamp: serverTimestamp(),
            user_id: user.uid,
            viewed: false,
          },
        });
      }

      console.log("Document successfully written with file!");
    } catch (e) {
      console.error("Error:", e);
      alert("An error occurred. Check the console for details.");
    }
  };

  const truncate = (str, max) =>
    str.length > max ? `${str.slice(0, max)}...` : str;

  const handleOpen = () => setOpen(!open);

  return (
    <div className="mx-auto my-14 flex max-w-screen-lg flex-col gap-8">
      <Card className="h-full w-full border border-blue-gray-100 shadow-sm">
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div>
              <Typography variant="h6" color="blue-gray">
                Print Rewards
              </Typography>
              <Typography
                color="gray"
                variant="small"
                className="mt-1 font-normal"
              >
                These are the details regarding the user's request to redeem
                printed paper rewards.
              </Typography>
            </div>
            <div className="grid w-full shrink-0 grid-cols-1 gap-2 md:flex md:w-max">
              <div className="w-full md:w-72">
                <Input
                  label="Search"
                  icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mb-4"
                />
              </div>
              <Button
                onClick={handleOpen}
                className="flex w-2/5 items-center gap-3 text-center "
                size="sm"
              >
                <GiftTopIcon strokeWidth={2} className="h-4 w-4" /> Redeem
              </Button>
              <Dialog open={open} size="xs" handler={handleOpen}>
                <div className="flex items-center justify-between">
                  <DialogHeader className="flex flex-col items-start">
                    {" "}
                    <Typography className="mb-1" variant="h4">
                      Redeem Rewards
                    </Typography>
                  </DialogHeader>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="mr-3 h-5 w-5"
                    onClick={handleOpen}
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <form onSubmit={handleSubmit}>
                  <DialogBody>
                    <Typography
                      className="-mt-7 mb-6 "
                      color="gray"
                      variant="lead"
                    >
                      Insert the file (pdf) you want to be printed.
                    </Typography>

                    <div className="mb-2 grid gap-6">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf"
                        className="w-full cursor-pointer rounded bg-gray-100 text-sm font-medium text-gray-500 file:mr-4 file:cursor-pointer file:border-0 file:bg-gray-800 file:px-4 file:py-2 file:text-white file:hover:bg-gray-700"
                      />
                      {numPages !== null && (
                        <Typography variant="medium">
                          Number of Pages: {numPages}
                        </Typography>
                      )}
                    </div>
                    <Typography
                      className="-mb-1 mb-2"
                      color="blue-gray"
                      variant="h6"
                    >
                      Expected Deadline
                    </Typography>
                    <Input
                      onChange={handleInputChange}
                      name="deadline"
                      type="datetime-local"
                    />
                  </DialogBody>
                  <DialogFooter className="space-x-2">
                    <Button variant="text" color="gray" onClick={handleOpen}>
                      cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="gradient"
                      color="gray"
                      onClick={handleOpen}
                    >
                      Send Request
                    </Button>
                  </DialogFooter>
                </form>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0">
          <table className="w-full min-w-max table-auto text-left">
            <thead>
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th
                    key={head}
                    className={`border-b border-blue-gray-50 px-5 py-3 text-left ${
                      head === "Date" ? "hidden sm:table-cell" : ""
                    }`}
                  >
                    <Typography
                      variant="small"
                      className="text-[11px] font-bold uppercase text-blue-gray-400"
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(
                (
                  {
                    id,
                    document_name,
                    document_url,
                    status,
                    deadline,
                    submissionDate,
                  },
                  index,
                ) => {
                  const isLast = index === requests.length - 1;
                  const classes = isLast
                    ? "p-4"
                    : "p-4 border-b border-blue-gray-50";

                  return (
                    <tr key={id}>
                      <td className={classes}>
                        <Typography className="text-sm font-semibold text-blue-gray-600">
                          {truncate(document_name, 25)}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography className="text-sm font-normal text-blue-gray-600">
                          {formatTimestamp(deadline)}
                        </Typography>
                      </td>
                      <td className={`${classes} hidden md:table-cell`}>
                        <Typography className="text-sm font-normal text-blue-gray-600">
                          {formatTimestamp(submissionDate)}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <div className="w-max">
                          <Chip
                            size="sm"
                            variant="ghost"
                            value={status}
                            color={
                              status === "received"
                                ? "green"
                                : status === "cancelled"
                                ? "red"
                                : status === "rejected"
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
                            onClick={() => moveRequest(id)}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        </CardBody>
        <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
          <Typography variant="small" color="blue-gray" className="font-normal">
            Page 1 of 10
          </Typography>
          <div className="flex gap-2">
            <Button variant="outlined" size="sm">
              Previous
            </Button>
            <Button variant="outlined" size="sm">
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Redeem;
