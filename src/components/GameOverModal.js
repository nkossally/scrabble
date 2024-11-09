import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Modal, Grow } from "@mui/material";

export default function GameOverModal({ text }) {
  const [open, setOpen] = React.useState(true);
  const handleClose = () => setOpen(false);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 300,
    bgcolor: "background.paper",
    bgcolor: "#00e0ff",
    color: "white",
    "text-align": "center",
    outline: "2px solid white",
    boxShadow: 24,
    p: 4,
  };

  const textStyle = {
    mt: 2,
    "font-size": 40,
    "font-weight": "900",
    "text-transform": "uppercase",
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Grow
          in={open}
          style={{ transform: "translate(-50%, -50%)" }}
          {...(open ? { timeout: 500 } : {})}
        >
          <Box sx={style}>
            <Typography id="modal-modal-description" sx={textStyle}>
              {text}
            </Typography>
          </Box>
        </Grow>
      </Modal>
    </div>
  );
}
