import React, { useState, useRef, useEffect } from 'react'; // Ensure useRef is imported
import { PencilIcon } from "@heroicons/react/24/solid";
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
} from "@material-tailwind/react";


// Set up the worker path
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Set up the worker path to your local file
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
const TABLE_HEAD = ["Transaction", "Points", "Date", "Status", "Actions",];
 
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
      console.error('Error loading PDF:', error);
    }
  };

  const renderPage = async (pageNum) => {
    if (pdf) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
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
        <button onClick={goToPreviousPage} disabled={pageNum === 1}>Previous</button>
        <span>Page {pageNum} of {numPages}</span>
        <button onClick={goToNextPage} disabled={pageNum === numPages}>Next</button>
      </div>
    </div>
  );
};

export function UserTransactions() {
  const [file, setFile] = useState(null);

  const [fileName, setFileName] = useState('');
  const [numPages, setNumPages] = useState(null);



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
      console.error('Error loading PDF:', error);
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

 


  return (
    
    <div className="mx-auto my-14 flex max-w-screen-lg flex-col gap-8">
      <Card className="h-full w-full">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <Typography variant="h5" color="blue-gray">
              Rewards Request
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              These are the details regarding with user's prize redeeming request.

            </Typography>
          </div>
          <div className="flex w-full shrink-0 gap-2 md:w-max">
            <div className="w-full md:w-72">
              <Input
                label="Search"
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              />
            </div>
            <Button className="flex items-center gap-3" size="sm">
              <ArrowDownTrayIcon strokeWidth={2} className="h-4 w-4" /> Send Request
            </Button>
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
                  className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                >
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TABLE_ROWS.map(
              (
                {
                  img,
                  name,
                  amount,
                  date,
                  status,
                },
                index,
              ) => {
                const isLast = index === TABLE_ROWS.length - 1;
                const classes = isLast
                  ? "p-4"
                  : "p-4 border-b border-blue-gray-50";
 
                return (
                  <tr key={name}>
                    <td className={classes}>
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={img}
                          alt={name}
                          size="md"
                          className="border border-blue-gray-50 bg-blue-gray-50/50 object-contain p-1"
                        />
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-bold"
                        >
                          {name}
                        </Typography>
                      </div>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {amount}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {date}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <div className="w-max">
                        <Chip
                          size="sm"
                          variant="ghost"
                          value={status}
                          color={
                            status === "paid"
                              ? "green"
                              : status === "pending"
                              ? "amber"
                              : "red"
                          }
                        />
                      </div>
                    </td>
                   
                    <td className={classes}>
                      <Tooltip content="Edit User">
                        <IconButton variant="text">
                          <PencilIcon className="h-4 w-4" />
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
        <Button variant="outlined" size="sm">
          Previous
        </Button>
       
        <Button variant="outlined" size="sm">
          Next
        </Button>
      </CardFooter>
    </Card>
    <div>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {pdfURL && (
        <iframe
          src={pdfURL}
          width="100%"
          height="600px"
          style={{ border: 'none' }}
          title="PDF Viewer"
        ></iframe>
      )}      <div>
        <p>File Name: {fileName}</p>
        <p>Number of Pages: {numPages}</p>
      </div>
    </div>
    </div>
    
  );
}

export default UserTransactions;
