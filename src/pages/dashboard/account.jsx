import React, { useState } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Input,
  Button,
} from "@material-tailwind/react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateEmail,
  sendEmailVerification,
} from "firebase/auth"; // Firebase methods
import { doc, updateDoc } from "firebase/firestore"; // Firestore imports
import { useUser } from "@/context/AuthContext"; // Use your Auth context
import { FirebaseFirestore } from "@/firebase";

export function Accounts() {
  const [passwordShown, setPasswordShown] = useState(false);
  const togglePasswordVisibility = () => setPasswordShown((cur) => !cur);
  const { user } = useUser(); // Get current user from context
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
    newEmail: "",
  });

  const handleInputChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  // Password update handler
  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (formValues.newPassword === formValues.confirmPassword) {
      reauthenticateAndChangePassword();
    } else {
      alert("Passwords do not match!");
    }
  };

  const handleEmailUpdate = (e) => {
    e.preventDefault();
    // Check if the current email matches the authenticated user's email
    if (formValues.email !== user.email) {
      alert(
        "The current email you entered does not match your existing email.",
      );
      return;
    }
    changeEmail(); // Proceed with reauthentication and email update if the emails match
  };

  // Re-authenticate user and update password
  const reauthenticateAndChangePassword = () => {
    const auth = getAuth(); // Get Firebase auth instance
    const credential = EmailAuthProvider.credential(
      user.email,
      formValues.password,
    ); // Re-authenticate user with current password

    reauthenticateWithCredential(auth.currentUser, credential)
      .then(() => {
        return updatePassword(auth.currentUser, formValues.newPassword); // Update password
      })
      .then(() => {
        alert("Password updated successfully!");
        setFormValues({
          email: "",
          password: "",
          newPassword: "",
          confirmPassword: "",
          newEmail: "",
        });
      })
      .catch((error) => {
        console.error("Error updating password:", error);
        alert("Error updating password");
      });
  };

  const changeEmail = () => {
    const auth = getAuth();
    const user = auth.currentUser;

    // Re-authenticate the user before updating email
    const credential = EmailAuthProvider.credential(
      formValues.email,
      formValues.password,
    );

    reauthenticateWithCredential(user, credential)
      .then(() => {
        // Now update the email
        return updateEmail(user, formValues.newEmail);
      })
      .then(() => {
        // Send email verification if needed
        return sendEmailVerification(user);
      })
      .then(() => {
        // Update email in Firestore after successfully updating in Firebase Auth
        const userDocRef = doc(FirebaseFirestore, "users", user.uid);
        return updateDoc(userDocRef, {
          email: formValues.newEmail,
        });
      })
      .then(() => {
        alert("Email updated successfully! Please verify your new email.");
        setFormValues({
          email: "",
          password: "",
          newPassword: "",
          confirmPassword: "",
          newEmail: "",
        });
      })
      .catch((error) => {
        console.error("Error updating email:", error);
        alert("Failed to update email. Please try again.");
      });
  };

  return (
    <div className="mx-auto my-20 flex max-w-screen-lg flex-col gap-8">
      {/* Manage Password Section */}
      <Card className="border border-blue-gray-100 shadow-sm">
        <CardHeader
          color="transparent"
          floated={false}
          shadow={false}
          className="m-0 px-4 pt-4"
        >
          <Typography variant="h5" color="blue-gray">
            Manage Password
          </Typography>
        </CardHeader>
        <form onSubmit={handlePasswordUpdate}>
          <CardBody className="flex flex-col gap-4 p-4">
            <div>
              <Typography>Change Password</Typography>
              <Typography>Update your password below</Typography>
            </div>
            <Input
              label="Current Password"
              onChange={handleInputChange}
              name="password"
              size="lg"
              required
              type={passwordShown ? "text" : "password"}
              icon={
                <i onClick={togglePasswordVisibility}>
                  {passwordShown ? (
                    <EyeIcon className="h-5 w-5" />
                  ) : (
                    <EyeSlashIcon className="h-5 w-5" />
                  )}
                </i>
              }
            />
            <Input
              label="New Password"
              onChange={handleInputChange}
              name="newPassword"
              size="lg"
              required
              type={passwordShown ? "text" : "password"}
              icon={
                <i onClick={togglePasswordVisibility}>
                  {passwordShown ? (
                    <EyeIcon className="h-5 w-5" />
                  ) : (
                    <EyeSlashIcon className="h-5 w-5" />
                  )}
                </i>
              }
            />
            <Input
              label="Confirm New Password"
              onChange={handleInputChange}
              name="confirmPassword"
              size="lg"
              required
              type={passwordShown ? "text" : "password"}
              icon={
                <i onClick={togglePasswordVisibility}>
                  {passwordShown ? (
                    <EyeIcon className="h-5 w-5" />
                  ) : (
                    <EyeSlashIcon className="h-5 w-5" />
                  )}
                </i>
              }
            />
            <div>
              <Button type="submit">Change Password</Button>
            </div>
          </CardBody>
        </form>
      </Card>

      {/* Update Email Section */}
      <Card className="border border-blue-gray-100 shadow-sm">
        <CardHeader
          color="transparent"
          floated={false}
          shadow={false}
          className="m-0 px-4 pt-4"
        >
          <Typography variant="h5" color="blue-gray">
            Update Email
          </Typography>
        </CardHeader>
        <form onSubmit={handleEmailUpdate}>
          <CardBody className="flex flex-col gap-4 p-4">
            <div>
              <Typography>Change Email</Typography>
              <Typography>Update your email below</Typography>
            </div>
            <Input
              label="Current Email"
              onChange={handleInputChange}
              name="email"
              size="lg"
              required
              type="email"
            />
            <Input
              label="Password"
              onChange={handleInputChange}
              name="password"
              size="lg"
              required
              type="password"
            />
            <Input
              label="New Email"
              onChange={handleInputChange}
              name="newEmail"
              size="lg"
              required
              type="email"
            />
            <div>
              <Button type="submit">Change Email</Button>
            </div>
          </CardBody>
        </form>
      </Card>
    </div>
  );
}

export default Accounts;
