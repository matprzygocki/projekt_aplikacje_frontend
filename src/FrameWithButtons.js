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
    Pagination
} from "@mui/material";
import keycloak from "./keycloak";

const FrameWithButtons = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [editIndex, setEditIndex] = useState(null);
    const [editComplaint, setEditComplaint] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(5);

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

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleStatusChange = (e) => {
        setFilterStatus(e.target.value);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const filteredData = data.filter((complaint) =>
        complaint.companyName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterStatus === "" || complaint.complaintStatus === filterStatus)
    );

    const paginatedData = filteredData.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

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
                                    <Grid container direction={"row"} spacing={2}>
                                        <Grid item>
                                            <Button
                                                variant="outlined"
                                                onClick={() => fetchData()}
                                                disabled={loading}
                                            >
                                                Pobierz wyniki
                                            </Button>
                                        </Grid>
                                        <Grid item>
                                            <TextField
                                                label="Szukaj"
                                                variant="outlined"
                                                value={searchTerm}
                                                onChange={handleSearchChange}
                                            />
                                        </Grid>
                                        <Grid item>
                                            <FormControl variant="outlined" fullWidth>
                                                <InputLabel>Status</InputLabel>
                                                <Select
                                                    value={filterStatus}
                                                    onChange={handleStatusChange}
                                                    label="Status"
                                                >
                                                    <MenuItem value="">Wszystkie</MenuItem>
                                                    <MenuItem value="Pending">Oczekujące</MenuItem>
                                                    <MenuItem value="In Progress">W trakcie realizacji</MenuItem>
                                                    <MenuItem value="Resolved">Zakończone</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
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
                                                    <TableCell>Nazwa firmy</TableCell>
                                                    <TableCell>Model urządzenia</TableCell>
                                                    <TableCell>Opis usterki</TableCell>
                                                    <TableCell>Status reklamacji</TableCell>
                                                    <TableCell>Akcje</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {paginatedData.map((complaint, index) => (
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
                                                                            <MenuItem value="Pending">Oczekujące</MenuItem>
                                                                            <MenuItem value="In Progress">W trakcie realizacji</MenuItem>
                                                                            <MenuItem value="Resolved">Zakończone</MenuItem>
                                                                        </Select>
                                                                    </FormControl>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Button
                                                                        variant="contained"
                                                                        onClick={handleSaveClick}
                                                                    >
                                                                        Zapisz
                                                                    </Button>
                                                                    <Button
                                                                        variant="outlined"
                                                                        onClick={handleCancelClick}
                                                                    >
                                                                        Anuluj
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
                                                                        Edytuj
                                                                    </Button>
                                                                </TableCell>
                                                            </>
                                                        )}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                    <Box display="flex" justifyContent="center" marginTop={2}>
                                        <Pagination
                                            count={Math.ceil(filteredData.length / rowsPerPage)}
                                            page={page}
                                            onChange={handlePageChange}
                                            color="primary"
                                        />
                                    </Box>
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
