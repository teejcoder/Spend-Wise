import { Box, Container, Button } from "@mui/material";
import logo from "../assets/squidward.jpg";

const Home = () => {
  function google() {
    window.open("/http://localhost3001/");
  }

  return (
    <Box
      component="div"
      sx={{
        backgroundColor: "#FCFCFC",
      }}
    >
      <Container
        component="main"
        maxWidth="xs"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >

          {/* <div>
            <img className="logo" src={logo} alt="Spend Wise Logo" />
          </div> */}
          <Box>
            <a href="/dashboard">dashboard</a>
            {/* <Button
              sx={{ backgroundColor: "#237EE9" }}
              onClick={google}
              variant="contained"
            >
              Sign in with Google
            </Button> */}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;