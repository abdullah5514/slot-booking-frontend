import HomePage from "./pages/HomePage";
import TimeSlots from "./pages/TimeSlotPage";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import TimeSlots from "./TimeSlots/TimeSlots";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme();

const  App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" exact element={<HomePage />} />
          <Route path="/timeslots" exact element={<TimeSlots />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
