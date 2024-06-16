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
    const [newComplaint, setNewComplaint] = useState({
        companyName: "",
        deviceModel: "",
        faultDescription: "",
        complaintStatus: "Pending", // Domyślny status reklamacji
    });

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewComplaint({ ...newComplaint, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch(url, {
            method: "POST",
            headers: {
                Authorization: "Bearer " + keycloak.token,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newComplaint),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                console.log("Complaint added successfully", data);
                // Opcjonalnie: zaktualizuj stan aplikacji po dodaniu reklamacji
                setNewComplaint({
                    companyName: "",
                    deviceModel: "",
                    faultDescription: "",
                    complaintStatus: "Pending",
                });
                // Możesz dodać tutaj obsługę, np. zaktualizować stan aplikacji po dodaniu
                fetchData(); // Pobierz ponownie dane po dodaniu reklamacji
            })
            .catch((error) => {
                console.error("There was an error adding complaint!", error);
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

    const calculateRemainingTime = (createdAt) => {
        const createdAtDate = new Date(createdAt);
        const currentDate = new Date();
        const millisecondsInDay = 24 * 60 * 60 * 1000; // Liczba milisekund w jednym dniu
        const timeDifference = currentDate - createdAtDate;
        const remainingDays = 14 - Math.floor(timeDifference / millisecondsInDay);
        return remainingDays;
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

                                {(keycloak.hasRealmRole("user")) && (
                                    <Card sx={{ marginLeft: 'auto', marginTop: 2 }}>
                                        <Typography variant="h5" gutterBottom>
                                            Zalogowany jako użytkownik
                                        </Typography>
                                    </Card>
                                )}

                                {(keycloak.hasRealmRole("technician")) && (
                                    <Card sx={{ marginLeft: 'auto', marginTop: 2 }}>
                                        <Typography variant="h5" gutterBottom>
                                            Zalogowany jako administrator
                                        </Typography>
                                    </Card>
                                )}


                            </Box>
                        </Card>
                    </Grid>


                    {(keycloak.hasRealmRole("user")||keycloak.hasRealmRole("technician")) && (
                        <Grid item xs={12}>
                            <Card>
                                <Box p={2}>
                                    <Typography variant="h5" gutterBottom>
                                        Dodaj nową reklamację
                                    </Typography>
                                    <form onSubmit={handleSubmit}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <TextField
                                                    label="Nazwa firmy"
                                                    variant="outlined"
                                                    fullWidth
                                                    name="companyName"
                                                    value={newComplaint.companyName}
                                                    onChange={handleInputChange}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    label="Model urządzenia"
                                                    variant="outlined"
                                                    fullWidth
                                                    name="deviceModel"
                                                    value={newComplaint.deviceModel}
                                                    onChange={handleInputChange}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    label="Opis usterki"
                                                    variant="outlined"
                                                    fullWidth
                                                    multiline
                                                    rows={4}
                                                    name="faultDescription"
                                                    value={newComplaint.faultDescription}
                                                    onChange={handleInputChange}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <FormControl variant="outlined" fullWidth>
                                                    <InputLabel>Status</InputLabel>
                                                    <Select
                                                        value={newComplaint.complaintStatus}
                                                        onChange={handleInputChange}
                                                        label="Status"
                                                        name="complaintStatus"
                                                    >
                                                        <MenuItem value="Pending">Oczekująca</MenuItem>
                                                        <MenuItem value="In Progress">W trakcie realizacji</MenuItem>
                                                        <MenuItem value="Resolved">Zakończona</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Button variant="contained" type="submit">
                                                    Dodaj reklamację
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </form>
                                </Box>
                            </Card>
                        </Grid>
                    )}




                    {(keycloak.hasRealmRole("technician")) && (
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
                                                    <TableCell>Numer reklamacji</TableCell>
                                                    <TableCell>Status reklamacji</TableCell>
                                                    <TableCell>Pozostały czas (dni)</TableCell>
                                                    <TableCell>Akcje</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {paginatedData.map((complaint, index) => (
                                                    <TableRow key={complaint.id}>
                                                        {editIndex === index ? (
                                                            <>
                                                                <TableCell>{complaint.companyName}</TableCell>
                                                                <TableCell>{complaint.deviceModel}</TableCell>
                                                                <TableCell>
                                                                    <TextField
                                                                        name="faultDescription"
                                                                        value={editComplaint.faultDescription}
                                                                        onChange={handleChange}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>{complaint.complaintNumber}</TableCell>
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
                                                                <TableCell>{calculateRemainingTime(complaint.createdAt)}</TableCell>
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
                                                                <TableCell>{complaint.complaintNumber}</TableCell>
                                                                <TableCell>{complaint.complaintStatus}</TableCell>
                                                                <TableCell>{calculateRemainingTime(complaint.createdAt)}</TableCell>
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
