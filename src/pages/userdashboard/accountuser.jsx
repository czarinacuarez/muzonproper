import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Input,
  Button,
  Select,
  Option,
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

export function UserAccount() {
  const [passwordShown, setPasswordShown] = useState(false);
  const togglePasswordVisibility = () => setPasswordShown((cur) => !cur);
  const { user, userInfo } = useUser(); // Get current user from context
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

  const handleProfile = (e) => {
    e.preventDefault();
    const userDocRef = doc(FirebaseFirestore, "users", user.uid);
    updateDoc(userDocRef, {
      lastname: formValues.lastname,
      firstname: formValues.firstname,
      email: formValues.email,
      area: formValues.area,
      gender: formValues.gender,
      civilStatus: formValues.civilStatus,
      phone: formValues.phone,
      youth: formValues.youth,
      ageGroup: formValues.ageGroup,
    })
      .then(() => {
        alert("Profile updated successfully!");
        // Optionally reset form values if desired
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
        alert("Failed to update profile. Please try again.");
      });
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
          lastname: userInfo?.lastname || "",
          firstname: userInfo?.firstname || "",
        });
      })
      .catch((error) => {
        console.error("Error updating email:", error);
        alert("Failed to update email. Please try again.");
      });
  };

  useEffect(() => {
    if (userInfo) {
      setFormValues((prevValues) => ({
        ...prevValues,
        lastname: userInfo.lastname || "",
        firstname: userInfo.firstname || "",
        phone: userInfo.phone || "",
        gender: userInfo.gender || "",
        civilStatus: userInfo.civilStatus || "",
        youth: userInfo.youth || "",
        ageGroup: userInfo.ageGroup || "",
        area: userInfo.area || "",
      }));
    }
  }, [userInfo]);

  const handleSelectChange = (e, field) => {
    console.log(e); // Inspect what e contains
    const value = e.target ? e.target.value : e; // Fallback to e if e.target is undefined
    setFormValues((prevValues) => ({
      ...prevValues,
      [field]: value,
    }));
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
            Manage Profile
          </Typography>
        </CardHeader>
        <form onSubmit={handleProfile}>
          <CardBody className="flex flex-col gap-4 p-4">
            <div>
              <Typography>Change Profile Information</Typography>
              <Typography>Update your profile information below</Typography>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Last Name"
                onChange={handleInputChange}
                name="lastname"
                size="lg"
                required
                type="text"
                value={formValues.lastname}
              />
              <Input
                label="First Name"
                onChange={handleInputChange}
                name="firstname"
                size="lg"
                required
                type="text"
                value={formValues.firstname}
              />
              <Input
                label="Phone"
                onChange={handleInputChange}
                size="lg"
                required
                value={formValues.phone}
                name="phone"
                type="tel"
                pattern="[0-9]{11}"
                title="Please enter an 11-digit phone number like 09566216696."
              />

              <Select
                value={formValues.gender}
                onChange={(value) => handleSelectChange(value, "gender")}
                size="lg"
                required
                name="gender"
                label="Gender"
              >
                <Option value="female">Female</Option>
                <Option value="male">Male</Option>
              </Select>

              <Select
                value={formValues.civilStatus}
                onChange={(value) => handleSelectChange(value, "civilStatus")}
                size="lg"
                required
                name="civilStatus"
                label="Civil Status"
              >
                <Option value="single">Single</Option>
                <Option value="married">Married</Option>
                <Option value="widowed">Widowed</Option>
                <Option value="separated">Separated</Option>
                <Option value="annulled">Annulled</Option>
                <Option value="live-in">Live-in</Option>
              </Select>

              <Select
                name="youth"
                onChange={(value) => handleSelectChange(value, "youth")}
                size="lg"
                required
                value={formValues.youth}
                label="Youth Classification"
              >
                <Option value="in-school-youth">In-School Youth</Option>
                <Option value="out-of-school-youth">Out-of-School Youth</Option>
                <Option value="employed-youth">Employed Youth</Option>
                <Option value="unemployed-youth">Unemployed Youth</Option>
                <Option value="pwd">Person With Disability</Option>
                <Option value="indigenous-people">Indigenous People</Option>
              </Select>

              <Select
                name="ageGroup"
                value={formValues.ageGroup}
                onChange={(value) => handleSelectChange(value, "ageGroup")}
                size="lg"
                required
                label="Age Group"
              >
                <Option value="child-youth">Child Youth (15-17)</Option>
                <Option value="core-youth">Core Youth (18-24)</Option>
                <Option value="adult-youth">Adult Youth (25-30)</Option>
              </Select>

              <Select
                name="area"
                value={formValues.area}
                onChange={(value) => handleSelectChange(value, "area")}
                size="lg"
                required
                label="Area"
              >
                <Option value="abandoned-road">Abandoned Road</Option>
                <Option value="amaresa-ii">Amaresa II</Option>
                <Option value="carriedo-street">Carriedo Street</Option>
                <Option value="francisco-homes-iii">Francisco Homes III</Option>
                <Option value="galahapmai">Galahapmai</Option>
                <Option value="graceville-subdivision">
                  Graceville Subdivision
                </Option>
                <Option value="kelsey-hills-subdivision">
                  Kelsey Hills Subdivision
                </Option>
                <Option value="marigold-subdivision">
                  Marigold Subdivision
                </Option>
                <Option value="mt-view-subdivision">
                  Mt. View Subdivision
                </Option>
                <Option value="noels-village-ii">Noel's Village II</Option>
                <Option value="old-road-lingap">Old Road Lingap</Option>
                <Option value="residencia-de-muzon">Residencia De Muzon</Option>
                <Option value="sarmiento-homes-subdivision">
                  Sarmiento Homes Subdivision
                </Option>
                <Option value="zone-1">Zone 1</Option>
                <Option value="zone-2">Zone 2</Option>
                <Option value="zone-4">Zone 4</Option>
              </Select>
            </div>

            <div>
              <Button type="submit">Change Profile Details</Button>
            </div>
          </CardBody>
        </form>
      </Card>
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

export default UserAccount;
