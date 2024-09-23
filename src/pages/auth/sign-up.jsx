import {
  Card,
  Input,
  Checkbox,
  Button,
  Select,
  Option,
  Typography,
  Alert,
} from "@material-tailwind/react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FirebaseAuth, FirebaseFirestore } from "../../firebase";
import { useUser } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

export function SignUp() {
  const { userType } = useUser();
  const navigate = useNavigate();
  const [passwordShown, setPasswordShown] = useState(false);
  const togglePasswordVisiblity = () => setPasswordShown((cur) => !cur);
  const [alert, setAlert] = useState({ message: "", color: "" });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (userType === "admin") {
      navigate("/dashboard/home");
    } else if (userType === "user") {
      navigate("/userdashboard/home");
    }
  }, [userType, navigate]);

  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
    firstname: "",
    lastname: "",
    area: "",
    gender: "",
    civilStatus: "",
    phone: "",
    youth: "",
    ageGroup: "",
  });

  const handleSelectChange = (e, field) => {
    console.log(e); // Inspect what e contains
    const value = e.target ? e.target.value : e; // Fallback to e if e.target is undefined
    setFormValues((prevValues) => ({
      ...prevValues,
      [field]: value,
    }));
  };

  const handleInputChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formValues.gender ||
      !formValues.civilStatus ||
      !formValues.youth ||
      !formValues.ageGroup ||
      !formValues.area
    ) {
      console.log("Validation failed, setting alert.");
      setAlert({
        message: "Please fill in all the required fields.",
        color: "red",
      });
      setOpen(true);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        FirebaseAuth,
        formValues.email,
        formValues.password,
      );
      const uid = userCredential.user.uid;
      await setDoc(doc(FirebaseFirestore, "users", uid), {
        firstname: formValues.firstname,
        lastname: formValues.lastname,
        email: formValues.email,
        area: formValues.area,
        verified: false,
        gender: formValues.gender,
        civilStatus: formValues.civilStatus,
        phone: formValues.phone,
        youth: formValues.youth,
        ageGroup: formValues.ageGroup,
        region: "III",
        city: "SJDM",
        province: "Bulacan",
        barangay: "Muzon Proper",
        type: "user",
      });

      await setDoc(doc(FirebaseFirestore, "userPoints", uid), {
        user_points_id: uid,
        points: 0,
        updatedAt: serverTimestamp(),
      });

      <Navigate to="/userdashboard/home" />;
    } catch (error) {
      switch (error.code) {
        case "auth/email-already-in-use":
          setAlert({
            message: "The email address is already in use by another account.",
            color: "red",
          });
          break;
        case "auth/weak-password":
          setAlert({
            message: "Password should be at least 6 characters.",
            color: "red",
          });
          break;
        case "auth/invalid-email":
          setAlert({
            message: "The email address is not valid.",
            color: "red",
          });
          break;
        default:
          setAlert({
            message: `Error: ${error.message}`,
            color: "red",
          });
      }
    }
  };

  return (
    <section className="m-8 flex">
      <div className="hidden h-full w-2/5 lg:block">
        <img
          src="/img/greenpattern2.png"
          className="h-full w-full rounded-3xl object-cover"
        />
      </div>
      <div className="flex w-full flex-col items-center justify-center lg:w-3/5">
        <div className="text-center">
          <Typography variant="h2" color="green" className="mb-4 font-bold">
            Join Us Today
          </Typography>
          <Typography
            variant="paragraph"
            color="blue-gray"
            className="text-base font-normal"
          >
            Enter your details to register
          </Typography>
        </div>
        <form
          onSubmit={handleSubmit}
          className="mx-auto mb-2 mt-8 w-80 max-w-screen-lg lg:w-1/2"
        >
          <div className="mb-4 flex flex-col gap-6">
            <Input
              color="green"
              label="Email"
              onChange={handleInputChange}
              name="email"
              type="email"
              size="lg"
              required
            />
          </div>
          <div className="mb-4 flex flex-col gap-6">
            <Input
              color="green"
              label="Password"
              onChange={handleInputChange}
              name="password"
              size="lg"
              required
              type={passwordShown ? "text" : "password"}
              icon={
                <i onClick={togglePasswordVisiblity}>
                  {passwordShown ? (
                    <EyeIcon className="h-5 w-5" />
                  ) : (
                    <EyeSlashIcon className="h-5 w-5" />
                  )}
                </i>
              }
            />
          </div>
          <div className="mb-4 flex flex-col gap-6">
            <Input
              color="green"
              label="Phone Number"
              onChange={handleInputChange}
              name="phone"
              type="tel"
              size="lg"
              required
              pattern="[0-9]{11}"
              title="Please enter an 11-digit phone number like 09566216696."
            />
          </div>
          <div className="grid grid-cols-1  md:grid-cols-2  md:gap-3">
            <div className="mb-4 flex flex-col gap-6">
              <Input
                color="green"
                label="Last Name"
                onChange={handleInputChange}
                name="lastname"
                type="text"
                size="lg"
                required
              />
            </div>
            <div className="mb-4 flex flex-col gap-6">
              <Input
                color="green"
                label="First Name"
                onChange={handleInputChange}
                name="firstname"
                type="text"
                size="lg"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1  md:grid-cols-2  md:gap-3">
            <div className="mb-4 flex flex-col gap-6">
              <Select
                color="green"
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
            </div>
            <div className="mb-4 flex flex-col gap-6">
              <Select
                value={formValues.civilStatus}
                onChange={(value) => handleSelectChange(value, "civilStatus")}
                size="lg"
                required
                color="green"
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
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-3">
            <div className="mb-4 flex flex-col gap-6">
              <Select
                name="youth"
                color="green"
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
            </div>
            <div className="mb-4 flex flex-col gap-6">
              <Select
                name="ageGroup"
                color="green"
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
            </div>
          </div>
          <div className="mb-4 flex flex-col gap-6">
            <Select
              name="area"
              onChange={(value) => handleSelectChange(value, "area")}
              size="lg"
              required
              color="green"
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
              <Option value="marigold-subdivision">Marigold Subdivision</Option>
              <Option value="mt-view-subdivision">Mt. View Subdivision</Option>
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
          {/* <Checkbox
            label={
              <Typography
                variant="small"
                color="gray"
                className="flex items-center justify-start font-medium"
              >
                I agree the&nbsp;
                <a
                  href="#"
                  className="font-normal text-black transition-colors hover:text-gray-900 underline"
                >
                  Terms and Conditions
                </a>
              </Typography>
            }
            containerProps={{ className: "-ml-2.5" }}
          /> */}
          <Button type="submit" color="green" className="my-6" fullWidth>
            Register Now
          </Button>

          <Alert
            open={open}
            onClose={() => setOpen(false)}
            color={alert.color}
            className="mb-4"
          >
            {alert.message || "A dismissible alert for showing message."}
          </Alert>
          {/* <div className="space-y-4 mt-8">
            <Button size="lg" color="white" className="flex items-center gap-2 justify-center shadow-md" fullWidth>
              <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_1156_824)">
                  <path d="M16.3442 8.18429C16.3442 7.64047 16.3001 7.09371 16.206 6.55872H8.66016V9.63937H12.9813C12.802 10.6329 12.2258 11.5119 11.3822 12.0704V14.0693H13.9602C15.4741 12.6759 16.3442 10.6182 16.3442 8.18429Z" fill="#4285F4" />
                  <path d="M8.65974 16.0006C10.8174 16.0006 12.637 15.2922 13.9627 14.0693L11.3847 12.0704C10.6675 12.5584 9.7415 12.8347 8.66268 12.8347C6.5756 12.8347 4.80598 11.4266 4.17104 9.53357H1.51074V11.5942C2.86882 14.2956 5.63494 16.0006 8.65974 16.0006Z" fill="#34A853" />
                  <path d="M4.16852 9.53356C3.83341 8.53999 3.83341 7.46411 4.16852 6.47054V4.40991H1.51116C0.376489 6.67043 0.376489 9.33367 1.51116 11.5942L4.16852 9.53356Z" fill="#FBBC04" />
                  <path d="M8.65974 3.16644C9.80029 3.1488 10.9026 3.57798 11.7286 4.36578L14.0127 2.08174C12.5664 0.72367 10.6469 -0.0229773 8.65974 0.000539111C5.63494 0.000539111 2.86882 1.70548 1.51074 4.40987L4.1681 6.4705C4.8001 4.57449 6.57266 3.16644 8.65974 3.16644Z" fill="#EA4335" />
                </g>
                <defs>
                  <clipPath id="clip0_1156_824">
                    <rect width="16" height="16" fill="white" transform="translate(0.5)" />
                  </clipPath>
                </defs>
              </svg>
              <span>Sign in With Google</span>
            </Button>
            <Button size="lg" color="white" className="flex items-center gap-2 justify-center shadow-md" fullWidth>
              <img src="/img/twitter-logo.svg" height={24} width={24} alt="" />
              <span>Sign in With Twitter</span>
            </Button>
          </div> */}
          <Typography
            variant="paragraph"
            className="mt-4 text-center font-medium text-blue-gray-500"
          >
            Already have an account?
            <Link to="/auth/sign-in" className="ml-1 text-gray-900">
              Sign in
            </Link>
          </Typography>
        </form>
      </div>
    </section>
  );
}

export default SignUp;
