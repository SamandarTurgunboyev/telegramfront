import { Box, CircularProgress, Typography } from "@mui/material";
import PropTypes from 'prop-types';

function CircularProgressWithLabel(props) {
    return (
        <Box sx={{ position: 'relative', display: 'inline-flex', width: "20vw", marginTop: "10px", marginBottom: "10px", }}>
            <CircularProgress variant="determinate" {...props} sx={{ height: "50vh" }} />
            <Box
                sx={{
                    top: 0,
                    bgcolor: 'gray',
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: "20vh"
                }}
            >
                <Typography
                    variant="caption"
                    component="div"
                    sx={{ color: 'blue' }}
                >
                    {`${Math.round(props.value)}%`}
                </Typography>
            </Box>
        </Box>
    );
}

CircularProgressWithLabel.propTypes = {
    value: PropTypes.number.isRequired,
};

export default CircularProgressWithLabel