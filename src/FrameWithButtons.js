import React, { useState, useEffect } from "react";
import {
    Container,
    Box,
    Card,
    CircularProgress,
    Grid,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from "@mui/material";
import keycloak from "./keycloak";

const FrameWithButtons = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [editIndex, setEditIndex] = useState(null);
    const [editComplaint, setEditComplaint] = useState({});

    const url = "http://localhost:8081/api/complaints";

    const fetchData = () => {
        setLoading(true);
        fetch(url, {
            method: "GET",
            headers: {
                Authorization: "Bearer " + keycloak.token,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setData(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("There was an error!", error);
                setLoading(false);
            });
    };

    const handleEditClick = (index) => {
        setEditIndex(index);
        setEditComplaint(data[index]);
    };

    const handleSaveClick = () => {
        const updatedData = [...data];
        updatedData[editIndex] = editComplaint;
        setData(updatedData);
        setEditIndex(null);

        fetch(`${url}/${editComplaint.id}`, {
            method: "PUT",
            headers: {
                Authorization: "Bearer " + keycloak.token,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(editComplaint),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                console.log("Update successful", data);
            })
            .catch((error) => {
                console.error("There was an error updating the complaint!", error);
            });
    };

    const handleCancelClick = () => {
        setEditIndex(null);
    };

    const handleChange = (e) => {
        setEditComplaint({ ...editComplaint, [e.target.name]: e.target.value });
    };


    return (
        <Container>
            <Box p={2}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Card>
                            <Box
                                p={2}
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <Button variant="contained" onClick={() => keycloak.logout()}>
                                    Wyloguj
                                </Button>
                            </Box>
                        </Card>
                    </Grid>

                    {(keycloak.hasRealmRole("user") || keycloak.hasRealmRole("technician")) && (
                        <Grid item xs={12}>
                            <Card>
                                <Box p={2}>
                                    <Typography variant="h5" gutterBottom>
                                        Lista reklamacji
                                    </Typography>
                                    <Grid container direction={"row"}>
                                        <Button
                                            variant="outlined"
                                            onClick={() => fetchData()}
                                            disabled={loading}
                                        >
                                            Pobierz wyniki
                                        </Button>
                                        {loading && (
                                            <Box ml={2}>
                                                <CircularProgress ml={2} />
                                            </Box>
                                        )}
                                    </Grid>
                                    <TableContainer component={Card} sx={{ marginTop: 2 }}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Company Name</TableCell>
                                                    <TableCell>Device Model</TableCell>
                                                    <TableCell>Fault Description</TableCell>
                                                    <TableCell>Complaint Status</TableCell>
                                                    <TableCell>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {data.map((complaint, index) => (
                                                    <TableRow key={complaint.id}>
                                                        {editIndex === index ? (
                                                            <>
                                                                <TableCell>
                                                                    <TextField
                                                                        name="companyName"
                                                                        value={editComplaint.companyName}
                                                                        onChange={handleChange}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <TextField
                                                                        name="deviceModel"
                                                                        value={editComplaint.deviceModel}
                                                                        onChange={handleChange}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <TextField
                                                                        name="faultDescription"
                                                                        value={editComplaint.faultDescription}
                                                                        onChange={handleChange}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <FormControl fullWidth>
                                                                        <InputLabel>Status</InputLabel>
                                                                        <Select
                                                                            name="complaintStatus"
                                                                            value={editComplaint.complaintStatus}
                                                                            onChange={handleChange}
                                                                        >
                                                                            <MenuItem value="Pending">Pending</MenuItem>
                                                                            <MenuItem value="In Progress">In Progress</MenuItem>
                                                                            <MenuItem value="Resolved">Resolved</MenuItem>
                                                                        </Select>
                                                                    </FormControl>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Button
                                                                        variant="contained"
                                                                        onClick={handleSaveClick}
                                                                    >
                                                                        Save
                                                                    </Button>
                                                                    <Button
                                                                        variant="outlined"
                                                                        onClick={handleCancelClick}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                </TableCell>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <TableCell>{complaint.companyName}</TableCell>
                                                                <TableCell>{complaint.deviceModel}</TableCell>
                                                                <TableCell>{complaint.faultDescription}</TableCell>
                                                                <TableCell>{complaint.complaintStatus}</TableCell>
                                                                <TableCell>
                                                                    <Button
                                                                        variant="outlined"
                                                                        onClick={() => handleEditClick(index)}
                                                                    >
                                                                        Rozpatrz
                                                                    </Button>
                                                                </TableCell>
                                                            </>
                                                        )}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            </Card>
                        </Grid>
                    )}
                </Grid>
            </Box>
        </Container>
    );
};

export default FrameWithButtons;
