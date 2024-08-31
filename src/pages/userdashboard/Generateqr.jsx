import QRCode from 'qrcode';
import React, { useState, useEffect } from 'react';
import { FirebaseAuth, FirebaseFirestore } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

const Generateqr = () => {
  const [userId, setUserId] = useState(null);
  const [qrcode, setQrcode] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FirebaseAuth, async (user) => {
      if (user) {
        setUserId(user.uid);
        setUserEmail(user.email || '');

        const qrCodeDocRef = doc(FirebaseFirestore, 'qrCodes', user.uid);
        const qrCodeDoc = await getDoc(qrCodeDocRef);

        if (qrCodeDoc.exists()) {
          const existingQrCodeId = qrCodeDoc.data().id;
          setQrCodeGenerated(true);
          generateQRCode(existingQrCodeId);
        } else {
          setQrCodeGenerated(false);
        }
      } else {
        setUserId(null);
        setQrCodeGenerated(false);
        setUserEmail('');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGenerateQRCode = async () => {
    if (!userId) return;

    const newQrCodeId = userId; // Use userId as the QR code ID

    await setDoc(doc(FirebaseFirestore, 'qrCodes', userId), {
      id: newQrCodeId,
      email: userEmail,
      createdAt: new Date(),
    });

    setQrCodeGenerated(true);
    generateQRCode(newQrCodeId);
  };

  const generateQRCode = (qrCodeValue) => {
    QRCode.toDataURL(
      qrCodeValue,
      {
        width: 800,
        margin: 1,
      },
      (err, url) => {
        if (err) {
          console.error(err);
          return;
        }
        setQrcode(url);
      }
    );
  };

  return (
    <>
      {/* Button to open the modal */}
      <button
         className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700" type="button"
        onClick={() => setShowModal(true)}
      >
        Generate QR
      </button>

      {/* Modal */}
      {showModal ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              {/* Content */}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none h-3/6">
                {/* Header */}
                {/* <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t"> */}
                  {/* <h3 className="text-3xl font-semibold text-black mx-auto">Generate QR Code</h3> */}
                  {/* <button
                    className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                      ×
                    </span>
                  </button> */}
                {/* </div> */}
                {/* Body */}
                <div className="relative p-6 flex-auto">
                  {userId ? (
                    <>
                      {!qrCodeGenerated ? (
                        <button
                          onClick={handleGenerateQRCode}
                          className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                          Generate QR Code
                        </button>
                      ) : (
                        <p className='text-black text-center'>Your QR Code is ready:</p>
                      )}

                      {qrcode && (
                        <>
                          <img src={qrcode} alt="QR Code" className="mt-4" />
                          <a href={qrcode} download="qrcode.png">
                            <button className="bg-red-200 mt-2 p-2 text-black">Download QR Code</button>
                          </a>
                        </>
                      )}
                    </>
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
                {/* Footer */}
                <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  );
};

export default Generateqr;