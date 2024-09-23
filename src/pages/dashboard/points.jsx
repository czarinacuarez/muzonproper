import React, { useState, useRef, useEffect } from "react"; // Ensure useRef is imported
import { EyeIcon } from "@heroicons/react/24/solid";
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
  IconButton,
  Tooltip,
  Avatar,
} from "@material-tailwind/react";
import { useUser } from "@/context/AuthContext";
import { collection, query, onSnapshot, getDoc, doc } from "firebase/firestore";
import { FirebaseFirestore } from "@/firebase";
import { useNavigate } from "react-router-dom";
// Set up the worker path
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

// Set up the worker path to your local file
GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const TABLE_HEAD = ["User", "Points", "Date", "Transaction", "Actions"];

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

export function PointsHistory() {
  const [file, setFile] = useState(null);
  const [size, setSize] = useState(null);
  const navigate = useNavigate();
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const { user } = useUser();
  const [mergedHistory, setMergedHistory] = useState([]);
  const [fileName, setFileName] = useState("");
  const [numPages, setNumPages] = useState(null);
  const [pdfURL, setPdfURL] = useState(null);

  const handleOpen = (value, transaction = null) => {
    setSize(value); // Set the dialog size
    setSelectedTransaction(transaction); // Store transaction data
  };

  const moveRequest = (id) => {
    navigate(`/dashboard/request/${id}`);
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
    const pointsAddedQuery = query(
      collection(FirebaseFirestore, "pointsAddedHistory"),
    );
    const pointsReductionQuery = query(
      collection(FirebaseFirestore, "pointsReductionHistory"),
    );

    const fetchUserData = async (userId) => {
      try {
        const userDocRef = doc(FirebaseFirestore, "users", userId);
        const userDoc = await getDoc(userDocRef);

        // Check if user data exists and has the expected fields
        if (userDoc.exists()) {
          const userData = userDoc.data();
          return {
            firstName: userData.firstname || "Unknown",
            lastName: userData.lastname || "User",
            email: userData.email || "loading",
          };
        } else {
          console.warn(`User with ID ${userId} does not exist.`);
          return { firstName: "Unknown", lastName: "User" };
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        return { firstName: "Unknown", lastName: "User" };
      }
    };

    const unsubscribeAdded = onSnapshot(pointsAddedQuery, async (snapshot) => {
      const addedPoints = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          const user = await fetchUserData(data.userId);

          return {
            ...data,
            type: "added",
            id: doc.id,
            points: data.points,
            user,
          };
        }),
      );

      setMergedHistory((prev) => {
        const updated = [...prev, ...addedPoints];
        const unique = Array.from(
          new Map(updated.map((item) => [item.id, item])).values(),
        );
        return unique.sort((a, b) => b.timestamp - a.timestamp); // Ensure correct sorting
      });
    });

    const unsubscribeReduction = onSnapshot(
      pointsReductionQuery,
      async (snapshot) => {
        const reducedPoints = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const user = await fetchUserData(data.userId);

            return {
              ...data,
              type: "reduced",
              id: doc.id,
              points: data.points_deducted,
              user,
            };
          }),
        );

        setMergedHistory((prev) => {
          const updated = [...prev, ...reducedPoints];
          const unique = Array.from(
            new Map(updated.map((item) => [item.id, item])).values(),
          );
          return unique.sort((a, b) => b.timestamp - a.timestamp); // Ensure correct sorting
        });
      },
    );

    return () => {
      unsubscribeAdded();
      unsubscribeReduction();
    };
  }, []);

  return (
    <div className="mx-auto my-14 flex max-w-screen-xl flex-col gap-8">
      <Card className="h-full w-full border border-blue-gray-100 shadow-sm">
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div>
              <Typography variant="h5" color="green">
                Points History
              </Typography>
              <Typography color="gray" className="mt-1 font-normal">
                These are the details regarding the user's points transaction
                history.
              </Typography>
            </div>
          </div>
        </CardHeader>
        <CardBody className="max-h-96 overflow-auto  px-0">
          <table className=" w-full min-w-max table-auto text-left">
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
              {mergedHistory.map(
                (
                  {
                    type,
                    points,
                    smallBottles,
                    bigBottles,
                    timestamp,
                    id,
                    transactionId,
                    user,
                  },
                  index,
                ) => {
                  const isLast = index === mergedHistory.length - 1;
                  const classes = isLast
                    ? "p-4"
                    : "p-4 border-b border-blue-gray-50";
                  const userName = user
                    ? `${user.firstName} ${user.lastName}`
                    : "Unknown User";

                  const email = user.email;

                  return (
                    <tr key={id}>
                      <td className={classes}>
                        <div className="flex items-center gap-4">
                          <Avatar
                            src="/images/unknown.jpg"
                            size="sm"
                            variant="rounded"
                          />
                          <div>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-semibold"
                            >
                              {userName}
                            </Typography>
                            <Typography className="overflow-hidden truncate whitespace-nowrap text-xs font-normal text-blue-gray-500">
                              {email}
                            </Typography>
                          </div>
                        </div>
                      </td>

                      <td className={classes}>
                        <Typography className="text-center text-sm font-normal text-blue-gray-600">
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
              )}
            </tbody>
          </table>
        </CardBody>
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
                              <strong className="text-gray-700">Id:</strong>{" "}
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
    </div>
  );
}

export default PointsHistory;
