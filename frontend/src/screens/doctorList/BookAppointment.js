import React, { useState, useEffect } from "react";
import {
  Paper,
  CardHeader,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  FormHelperText,
} from "@material-ui/core";
import "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";

const BookAppointment = ({
  baseUrl,
  doctor,
  getUserAppointments,
  userAppointments,
  closeModalHandler,
}) => {
  const doctorName = `${doctor.firstName} ${doctor.lastName}`;

  const dateFormatter = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return "";
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState(["None"]);
  const [medicalHistory, setMedicalHistory] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [slotRequiredClass, setSlotRequiredClass] = useState("none");
  const [bookedSuccessfully, setBookedSuccessfully] = useState(false);

  const handleDateChange = (date) => {
    if (!(date instanceof Date) || isNaN(date)) {
      alert("Not a valid date");
      return;
    }
    setSelectedDate(date);
  };

  const handleSlotChange = (e) => {
    setSelectedSlot(e.target.value);
    setSlotRequiredClass("none");
  };

  const getAvailableSlots = async () => {
    const url = `${baseUrl}doctors/${doctor.id}/timeSlots?date=${dateFormatter(selectedDate)}`;

    try {
      const rawResponse = await fetch(url);
      if (rawResponse.ok) {
        const response = await rawResponse.json();
        if (response.timeSlot && response.timeSlot.length > 0) {
          setAvailableSlots(response.timeSlot);
        } else {
          setAvailableSlots(["None"]);
          alert("No slots available for this date.");
        }
      } else {
        alert("Error fetching available slots.");
      }
    } catch (e) {
      alert("Some error occurred");
    }
  };

  const bookAppointmentHandler = async (e) => {
    if (e) e.preventDefault();

    if (selectedSlot === "None" || selectedSlot === null || selectedSlot === "") {
      setSlotRequiredClass("block");
      return;
    }

    const emailId = JSON.parse(sessionStorage.getItem("userId"));
    const userDetails = JSON.parse(sessionStorage.getItem("user-details"));
    const accessToken = sessionStorage.getItem("accessToken");

    if (!emailId || !userDetails || !accessToken) {
      alert("Please Login to Book an appointment");
      closeModalHandler();
      return;
    }

    const existingBooking = userAppointments.filter(
      (appt) =>
        appt.appointmentDate === dateFormatter(selectedDate) &&
        appt.timeSlot === selectedSlot
    );

    if (existingBooking.length > 0) {
      alert("Either the slot is already booked or not available");
      return;
    }

    const data = {
      doctorId: doctor.id,
      doctorName: doctorName,
      userId: emailId,
      userName: `${userDetails.firstName} ${userDetails.lastName}`,
      timeSlot: selectedSlot,
      createdDate: dateFormatter(new Date()),
      appointmentDate: dateFormatter(selectedDate),
      symptoms: symptoms,
      priorMedicalHistory: medicalHistory,
    };

    const url = baseUrl + "appointments";
    try {
      const rawResponse = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (rawResponse.ok) {
        setBookedSuccessfully(true);
        getUserAppointments();
        setTimeout(() => {
          closeModalHandler();
        }, 1000);
      } else if (rawResponse.status === 400) {
        alert("Bad Request");
      } else {
        alert("Some error occurred");
      }
    } catch (e) {
      alert(e.message);
    }
  };

  useEffect(() => {
    getAvailableSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  return (
    <div>
      <Paper className="bookingModal">
        <CardHeader className="cardHeader" title="Book an Appointment" style={{backgroundco:'purple', color:'white'}} />
        <CardContent key={doctor.id}>
          <form noValidate autoComplete="off" onSubmit={bookAppointmentHandler}>
            <div>
              <TextField
                disabled
                label="Doctor Name"
                required
                value={doctorName}
              />
            </div>
            <div>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  disableToolbar
                  variant="inline"
                  format="MM/dd/yyyy"
                  margin="normal"
                  label="Select Date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                  }}
                />
              </MuiPickersUtilsProvider>
            </div>
            <div>
              <FormControl>
                <InputLabel id="timeSlotInput">Time Slot</InputLabel>
                <Select
                  labelId="timeSlotInput"
                  id="timeSlotInput"
                  value={selectedSlot}
                  onChange={handleSlotChange}
                >
                  <MenuItem value="None">
                    <em>None</em>
                  </MenuItem>
                  {availableSlots.map((slot, key) => (
                    <MenuItem key={key} value={slot}>
                      {slot}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText className={slotRequiredClass}>
                  <span className="red">Select a time slot</span>
                </FormHelperText>
              </FormControl>
            </div>
            <br />
            <div>
              <FormControl>
                <TextField
                  label="Medical History"
                  multiline
                  rows={4}
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                />
              </FormControl>
            </div>
            <br />
            <div>
              <FormControl>
                <TextField
                  label="Symptoms"
                  multiline
                  rows={4}
                  value={symptoms}
                  placeholder="ex. Cold, Swelling, etc."
                  onChange={(e) => setSymptoms(e.target.value)}
                />
              </FormControl>
            </div>
            <br />
            {bookedSuccessfully && (
              <FormControl>
                <span>Appointment booked successfully.</span>
              </FormControl>
            )}
            <br />
            <br />
            <Button
              id="bookappointment"
              type="submit"
              variant="contained"
              color="primary"
            >
              Book Appointment
            </Button>
          </form>
        </CardContent>
      </Paper>
    </div>
  );
};

export default BookAppointment;
