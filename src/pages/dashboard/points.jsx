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
} from "@material-tailwind/react";
import { useUser } from "@/context/AuthContext";
import { collection, query, onSnapshot } from "firebase/firestore";
import { FirebaseFirestore } from "@/firebase";
import { useNavigate } from "react-router-dom";
// Set up the worker path
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

// Set up the worker path to your local file
GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const TABLE_HEAD = ["Transaction", "Points", "Date", "Status", "Actions"];

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
    // Reference to pointsAddedHistory collection
    const pointsAddedQuery = query(
      collection(FirebaseFirestore, "pointsAddedHistory"),
    );

    // Reference to pointsReductionHistory collection
    const pointsReductionQuery = query(
      collection(FirebaseFirestore, "pointsReductionHistory"),
    );

    const unsubscribeAdded = onSnapshot(pointsAddedQuery, (snapshot) => {
      const addedPoints = snapshot.docs.map((doc) => ({
        ...doc.data(),
        type: "added",
        id: doc.id,
        points: doc.data().points,
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
          points: doc.data().points_deducted,
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
  }, []);

  return (
    <div className="mx-auto my-14 flex max-w-screen-lg flex-col gap-8">
      <Card className="h-full w-full border border-blue-gray-100 shadow-sm">
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div>
              <Typography variant="h6" color="blue-gray">
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
        <CardBody className="overflow-scroll px-0">
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
              {mergedHistory.map(
                ({ type, points, timestamp, id, transactionId }, index) => {
                  const isLast = index === mergedHistory.length - 1;
                  const classes = isLast
                    ? "p-4"
                    : "p-4 border-b border-blue-gray-50";

                  return (
                    <tr key={id}>
                      <td className={classes}>
                        <div className="flex items-center gap-2">
                          {type === "added" ? "Points Added" : "Points Reduced"}
                        </div>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {points}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {formatTimestamp(timestamp)}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Chip
                          value={type === "added" ? "Added" : "Reduced"}
                          color={type === "added" ? "green" : "red"}
                        />
                      </td>
                      <td className={classes}>
                        <div className="flex items-center gap-2">
                          <Tooltip content="View Document" placement="top">
                            <IconButton
                              onClick={() =>
                                handleOpen("lg", {
                                  type,
                                  fileName: transactionId, // or any other relevant identifier
                                })
                              }
                            >
                              <EyeIcon className="h-5 w-5" />
                            </IconButton>
                          </Tooltip>
                          {/* Add more actions if needed */}
                        </div>
                      </td>
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
      <Dialog open={size === "lg"} size="lg" handler={() => handleOpen(null)}>
        <DialogHeader>Document Preview</DialogHeader>
        <DialogBody>
          <PDFViewer file={file} />
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="blue" onClick={() => handleOpen(null)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default PointsHistory;
