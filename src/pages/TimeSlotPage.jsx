import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import GlobalStyles from "@mui/material/GlobalStyles";
import Container from "@mui/material/Container";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { useLocation } from "react-router-dom";
import moment from "moment";
import { ActionCableConsumer } from "react-actioncable-provider";

const TimeslotComponent = () => {
  const location = useLocation();

  const [showButton, setShowButton] = useState(false);
  const [ShowFailedButton, setShowFailedButton] = useState(false);
  const [showBookedSlots, setShowBookedSlots] = useState(false);
  const [postBoot, setPostBool] = useState(false);
  const [tiers, setTiers] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);

  // fetching available timestamps for booking
  useEffect(() => {
    fetchTimeStampApiHandler();
  }, []);

  useEffect(() => {
    if (postBoot) {
      fetchSlot();
    }
  }, [postBoot]);

  const handleClose = () => {
    setShowButton(false);
  };

  const handleErrorClose = () => {
    setShowFailedButton(false);
  };

  const fetchTimeStampApiHandler = async () => {
    fetch("/api/v1/timestamps?date=" + location.state.date)
      .then((response) => response.json())
      .then((data) => {
        setTiers(data);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const updateTimeslots = (index) => {
    const spliceIndex = Math.ceil(location.state.duration / 15);
    if (spliceIndex > 0) {
      if((spliceIndex - 1) + index < tiers.length){
        bookSlot({start: tiers[index].start, end: tiers[(spliceIndex - 1) + index].end });
        setShowBookedSlots(true);
        setShowButton(true);
        tiers.splice(index, spliceIndex);
      }
      else
      {
        setShowFailedButton(true);
      }
    } else {
      setShowFailedButton(true);
    }
  };



  // request to book a slot in timeslot record
  const bookSlot = (slot) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...slot, ...location.state }),
    };
    fetch("/api/v1/timeslots", requestOptions).then((response) => {
      response.json();
      setPostBool(true);
    });
  };

  const fetchSlot = async () => {
    await fetch("/api/v1/timeslots")
      .then((response) => response.json())
      .then((data) => {
        setBookedSlots(data);
        setPostBool(false);
      })
      .catch((err) => {
        console.log(err.message);
        setPostBool(false);
      });
  };

  const handleRecievedTimestamp = (response) => {
    console.log("On receive: ", response)
    console.log(response);
  };

  return (
    <ActionCableConsumer
      channel="TimestampsChannel"
      onInitialized={(value)=> console.log("on init: ", value)}
      onConnected={(value)=> console.log("on connected: ", value)}
      onDisconnected={(value)=> console.log("on dis-connected: ", value)}
      onRejected={(value)=> console.log("on onRejected: ", value)}
      onRecieved={(value) => console.log('OnReceived', value)} //{handleRecievedTimestamp}
    >
      <React.Fragment>
        <GlobalStyles
          styles={{ ul: { margin: 0, padding: 0, listStyle: "none" } }}
        />
        <Container
          disableGutters
          maxWidth="sm"
          component="main"
          sx={{ pt: 8, pb: 6 }}
        >
          <Typography
            component="h1"
            variant="h3"
            align="center"
            color="text.primary"
            gutterBottom
          >
            Available TimeSlots for booking
          </Typography>
          <Typography
            variant="h8"
            align="center"
            color="text.secondary"
            component="p"
          >
            Select appropriate timeslots to unload you container
          </Typography>
        </Container>
        <Container style={{ width: "100%" }}>
          <Container
            maxWidth="md"
            component="main"
            style={{
              float: showBookedSlots ? "left" : "center",
              width: showBookedSlots ? "60%" : "100%",
            }}
          >
            <Grid
              container
              spacing={2}
              alignItems="flex-end"
              marginBottom="50px"
            >
              {tiers.map((tier, index) => (
                <Grid item key={index} xs={12} md={3}>
                  <Card>
                    <CardActions>
                      <Button
                        fullWidth
                        id={index}
                        onClick={() => {
                          updateTimeslots(index);
                        }}
                      >
                        {tier.start} : {tier.end}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {showButton && (
              <Snackbar
                open={showButton}
                autoHideDuration={500}
                onClose={handleClose}
              >
                <MuiAlert
                  onClose={handleClose}
                  severity="success"
                  sx={{ width: "100%" }}
                >
                  Successfully booked.
                </MuiAlert>
              </Snackbar>
            )}
            {ShowFailedButton && (
              <Snackbar
                open={ShowFailedButton}
                autoHideDuration={700}
                onClose={handleErrorClose}
              >
                <MuiAlert
                  onClose={handleErrorClose}
                  severity="error"
                  sx={{ width: "100%" }}
                >
                  Invalid Timestamp/Duration.
                </MuiAlert>
              </Snackbar>
            )}
          </Container>
          {showBookedSlots && (
            <Container
              maxWidth="md"
              component="main"
              style={{ float: "right", width: showBookedSlots && "40%" }}
            >
              <Typography align="center">Booked Slots</Typography>
              {bookedSlots.map((tier, index) => (
                <Grid item key={index} xs={12} md={3} style={{ margin: "10%" }}>
                  <Card>
                    <CardActions>
                      <div>
                        <Typography>
                          Start:{" "}
                          {moment(tier.start)
                            .utc()
                            .format("MMMM Do YYYY, h:mm:ss a")}
                        </Typography>
                        <Typography>
                          End:{" "}
                          {moment(tier.end)
                            .utc()
                            .format("MMMM Do YYYY, h:mm:ss a")}
                        </Typography>
                      </div>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Container>
          )}
        </Container>
      </React.Fragment>
    </ActionCableConsumer>
  );
};

export default function TimeSlots() {
  return <TimeslotComponent />;
}
