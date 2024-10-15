import React, { useState, useRef, useEffect } from "react"; // Ensure useRef is imported
import { EyeIcon, PencilIcon, TvIcon } from "@heroicons/react/24/solid";
import {
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  Card,
  CardHeader,
  Typography,
  Dialog,
  Button,
  CardBody,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Chip,
  CardFooter,
  Avatar,
  IconButton,
  Tooltip,
  Input,
} from "@material-tailwind/react";
import { useUser } from "@/context/AuthContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { FirebaseFirestore } from "@/firebase";
import { useNavigate } from "react-router-dom";
// Set up the worker path
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

// Set up the worker path to your local file
GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
const TABLE_HEAD = ["Transaction", "Points", "Date", "Status", "Actions"];

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
const PDFViewer = ({ file }) => {
  const [pdf, setPdf] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (file) {
      loadPDF(file);
    }
  }, [file]);

  useEffect(() => {
    if (pdf) {
      renderPage(pageNum);
    }
  }, [pdf, pageNum]);

  const loadPDF = async (file) => {
    try {
      const pdfData = await file.arrayBuffer();
      const pdfDocument = await getDocument({ data: pdfData }).promise;
      setPdf(pdfDocument);
      setNumPages(pdfDocument.numPages);
      renderPage(1); // Render the first page
    } catch (error) {
      console.error("Error loading PDF:", error);
    }
  };

  const renderPage = async (pageNum) => {
    if (pdf) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
    }
  };

  const goToPreviousPage = () => {
    if (pageNum > 1) {
      setPageNum(pageNum - 1);
    }
  };

  const goToNextPage = () => {
    if (pageNum < numPages) {
      setPageNum(pageNum + 1);
    }
  };

  return (
    <div>
      <canvas ref={canvasRef}></canvas>
      <div>
        <button onClick={goToPreviousPage} disabled={pageNum === 1}>
          Previous
        </button>
        <span>
          Page {pageNum} of {numPages}
        </span>
        <button onClick={goToNextPage} disabled={pageNum === numPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export function UserTransactions() {
  const [file, setFile] = useState(null);
  const [size, setSize] = React.useState(null);
  const navigate = useNavigate();

  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const handleOpen = (value, transaction = null) => {
    setSize(value); // Set the dialog size
    setSelectedTransaction(transaction); // Store transaction data
  };
  const { user } = useUser();
  const [mergedHistory, setMergedHistory] = useState([]);
  const [fileName, setFileName] = useState("");
  const [numPages, setNumPages] = useState(null);
  const moveRequest = (id) => {
    navigate(`/userdashboard/request/${id}`);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file);
      setFileName(file.name);
      setPdfURL(URL.createObjectURL(file));
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

  const [pdfURL, setPdfURL] = useState(null);

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
    if (!user) return; // Exit if user is not defined

    const userId = user.uid;

    // Reference to pointsAddedHistory collection
    const pointsAddedQuery = query(
      collection(FirebaseFirestore, "pointsAddedHistory"),
      where("userId", "==", userId),
    );

    // Reference to pointsReductionHistory collection
    const pointsReductionQuery = query(
      collection(FirebaseFirestore, "pointsReductionHistory"),
      where("userId", "==", userId),
    );

    const unsubscribeAdded = onSnapshot(pointsAddedQuery, (snapshot) => {
      const addedPoints = snapshot.docs.map((doc) => ({
        ...doc.data(),
        type: "added",
        id: doc.id,
        points: doc.data().points,
        smallBottles: doc.data().smallBottles,
        bigBottles: doc.data().bigBottles,
      }));

      setMergedHistory((prev) => {
        const updated = [...prev, ...addedPoints];
        const unique = Array.from(
          new Map(updated.map((item) => [item.id, item])).values(),
        );
        return unique.sort((a, b) => b.timestamp - a.timestamp);
      });
    });

    const unsubscribeReduction = onSnapshot(
      pointsReductionQuery,
      (snapshot) => {
        const reducedPoints = snapshot.docs.map((doc) => ({
          ...doc.data(),
          type: "reduced",
          id: doc.id,
          points: doc.data().points_deducted, // Correctly map points_deducted
        }));

        setMergedHistory((prev) => {
          const updated = [...prev, ...reducedPoints];
          const unique = Array.from(
            new Map(updated.map((item) => [item.id, item])).values(),
          );
          return unique.sort((a, b) => b.timestamp - a.timestamp);
        });
      },
    );

    // Cleanup on unmount
    return () => {
      unsubscribeAdded();
      unsubscribeReduction();
    };
  }, [user]);

  if (!user) {
    return <div>Loading...</div>; // Optional: loading state if user data is not yet available
  }

  return (
    <div className=" mx-auto my-14 flex max-w-screen-lg flex-col gap-8">
      <Card className="h-full w-full border border-blue-gray-100 shadow-sm">
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div>
              <Typography variant="h5" color="green">
                Points History
              </Typography>
              <Typography
                color="gray"
                variant="small"
                className="mt-1 font-normal"
              >
                These are the details regarding with user's points transaction
                history.
              </Typography>
            </div>
            <div className="flex w-full shrink-0 gap-2 md:w-max">
              {/* <div className="w-full md:w-72">
                <Input
                  label="Search"
                  icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                />
              </div>
              <Button className="flex items-center gap-3" size="sm">
                <ArrowDownTrayIcon strokeWidth={2} className="h-4 w-4" /> Send
                Request
              </Button> */}
            </div>
          </div>
        </CardHeader>
        <CardBody className="max-h-96 overflow-auto px-0">
          <table className="w-full min-w-max table-auto text-left">
            <thead>
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th
                    key={head}
                    className="border-b border-blue-gray-50 px-5 py-3 text-left"
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
              {mergedHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-3 text-center">
                    <Typography className="text-sm font-semibold text-blue-gray-600">
                      No Data Available
                    </Typography>
                  </td>
                </tr>
              ) : (
                mergedHistory.map(
                  (
                    {
                      type,
                      points,
                      timestamp,
                      id,
                      transactionId,
                      smallBottles,
                      bigBottles,
                    },
                    index,
                  ) => {
                    const isLast = index === mergedHistory.length - 1;
                    const classes = isLast
                      ? "p-4"
                      : "p-4 border-b border-blue-gray-50";

                    return (
                      <tr key={id}>
                        <td className={classes}>
                          <div className="flex items-center gap-3">
                            <Typography className="text-sm font-semibold text-blue-gray-600">
                              {type === "added"
                                ? "Bottle Insertion"
                                : "Redeemed Rewards"}
                            </Typography>
                          </div>
                        </td>
                        <td className={classes}>
                          <Typography className="text-sm font-semibold text-blue-gray-600">
                            {points}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography className="text-sm font-normal text-blue-gray-600">
                            {formatTimestamp(timestamp)}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <div className="w-max">
                            <Chip
                              size="sm"
                              variant="ghost"
                              value={type}
                              color={type === "added" ? "green" : "red"}
                            />
                          </div>
                        </td>

                        <td className={classes}>
                          <Tooltip content="View Transaction">
                            {type === "added" ? (
                              <IconButton
                                onClick={() =>
                                  handleOpen("xs", {
                                    type,
                                    points,
                                    timestamp,
                                    id,
                                    smallBottles,
                                    bigBottles,
                                  })
                                }
                                variant="text"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </IconButton>
                            ) : (
                              <IconButton
                                onClick={() => moveRequest(transactionId)}
                                variant="text"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </IconButton>
                            )}
                          </Tooltip>
                        </td>
                      </tr>
                    );
                  },
                )
              )}
            </tbody>
          </table>
        </CardBody>
        <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
          {/* <Button variant="outlined" size="sm">
            Previous
          </Button>

          <Button variant="outlined" size="sm">
            Next
          </Button> */}
        </CardFooter>
      </Card>

      <Dialog
        open={
          size === "xs" ||
          size === "sm" ||
          size === "md" ||
          size === "lg" ||
          size === "xl" ||
          size === "xxl"
        }
        size={size || "md"}
        handler={handleOpen}
      >
        <DialogHeader>
          <Typography variant="h5" color="green">
            Bottle Insertion
          </Typography>
        </DialogHeader>
        <DialogBody>
          <Card className="pt-4">
            <CardHeader variant="gradient" color="green" className="mb-8 p-6">
              <Typography variant="h6" color="white">
                Transaction Details
              </Typography>
            </CardHeader>
            <CardBody className="px-6 pb-6 pt-0">
              <div className="">
                <table className="w-full min-w-[640px] table-auto text-left">
                  <thead></thead>
                  <tbody>
                    {selectedTransaction ? (
                      <tr>
                        <td colSpan="3">
                          <div className="space-y-2 text-sm">
                            <p>
                              <strong className="text-gray-700">
                                Transaction ID:
                              </strong>{" "}
                              {selectedTransaction.id}
                            </p>
                            <p>
                              <strong className="text-gray-700">Date:</strong>{" "}
                              {formatTimestamp(selectedTransaction.timestamp)}
                            </p>
                            <p>
                              <strong className="text-gray-700">
                                Small Bottles:
                              </strong>{" "}
                              {selectedTransaction.smallBottles}
                            </p>
                            <p>
                              <strong className="text-gray-700">
                                Big Bottles:
                              </strong>{" "}
                              {selectedTransaction.bigBottles}
                            </p>
                            <p>
                              <strong className="text-gray-700">
                                Total Bottles:
                              </strong>{" "}
                              {selectedTransaction.bigBottles +
                                selectedTransaction.smallBottles}
                            </p>
                            <p>
                              <strong className="text-gray-700">
                                Small Bottles Points:
                              </strong>{" "}
                              {selectedTransaction.smallBottles} * {3} ={" "}
                              {selectedTransaction.smallBottles * 3}
                            </p>
                            <p>
                              <strong className="text-gray-700">
                                Big Bottles Points:
                              </strong>{" "}
                              {selectedTransaction.bigBottles} * {5} ={" "}
                              {selectedTransaction.bigBottles * 5}
                            </p>
                            <p>
                              <strong className="text-gray-700">
                                Total Points:
                              </strong>{" "}
                              {selectedTransaction.points}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td
                          colSpan="3"
                          className="py-4 text-center text-gray-500"
                        >
                          No transaction data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="gradient"
            color="green"
            onClick={() => handleOpen(null)}
          >
            <span>Ok</span>
          </Button>
        </DialogFooter>
      </Dialog>

      {/* <div>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
        />
        {pdfURL && (
          <iframe
            src={pdfURL}
            width="100%"
            height="600px"
            style={{ border: "none" }}
            title="PDF Viewer"
          ></iframe>
        )}{" "}
        <div>
          <p>File Name: {fileName}</p>
          <p>Number of Pages: {numPages}</p>
        </div>
      </div> */}
    </div>
  );
}

export default UserTransactions;
