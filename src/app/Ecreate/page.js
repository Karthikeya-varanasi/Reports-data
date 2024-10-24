"use client"
import { useState, useEffect } from "react";
import Navigation from "../components/head/navigation/page";
import Tbar from "../components/head/tbar/page";
import { CiEdit } from "react-icons/ci";
import "../../../node_modules/bootstrap/dist/css/bootstrap.css";
import "../../../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";
import { AgGridReact } from "ag-grid-react";
import "../../../node_modules/ag-grid-community/styles/ag-grid.css";
import "../../../node_modules/ag-grid-community/styles/ag-theme-alpine.css";
import Select from 'react-select';
export default function Ecreate() {
  
  const [sidebarToggled, setSidebarToggled] = useState(false);
  const toggleSidebar = () => setSidebarToggled(!sidebarToggled);

  const [formData, setFormData] = useState({
    Username: '',
    Surname: '',
    Email: '',
    Password: '',
    Typeofaccess: '',
    Accessdate: '',
    networks: [],
    Userstatus: '',
    Buyercode: '', // Ensure Buyercode is initialized as an empty string
  });


  const [networkAccounts, setNetworkAccounts] = useState({});
  const [accountHolders, setAccountHolders] = useState([]);
  const [accountNumbers, setAccountNumbers] = useState([]);
  const [rowData, setRowData] = useState(); // State to hold user data

  useEffect(() => {
    fetchNetworkAccounts();
    fetchUserData();
  }, []);
  const fetchNetworkAccounts = async () => {
    try {
      const response = await fetch('/api/permissionapi');
      if (!response.ok) throw new Error('Failed to fetch network accounts');
      const data = await response.json();
      setNetworkAccounts(data.user.adAccounts);
    } catch (error) {
      console.error('Error fetching network accounts:', error);
    }
  };
  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/elist');
      if (!response.ok) throw new Error('Failed to fetch user data');
      const data = await response.json();

      setRowData(data.users);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  const editButtonRenderer = (params) => {
    return (
      <button 
        className="btn btn-primary btn-sm updatebtn w-100"
        data-bs-toggle="offcanvas"
        data-bs-target="#updateoffcanvasExampleuser"
        aria-controls="offcanvasExample"
        onClick={() => handleEdit(params.data)}
      >
      <CiEdit /> Edit 
      </button>
    );
  };
  const statusButtonRenderer = (params) => {
    // Log the value to see what is coming from the DB
    console.log('Status from DB:', params.value);
    
    // Case-insensitive comparison for 'active'
    const isActive = params.value && params.value.toLowerCase() === 'active';
  
    const statusContainerStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: '8px', // space between icon and text
    };
  
    const circleStyle = {
      width: '10px',
      height: '10px',
      backgroundColor: isActive ? 'green' : 'red',
      borderRadius: '50%',
    };
  
    const textStyle = {
      color: isActive ? 'green' : 'red',
      fontWeight: 'bold',
    };
  
    return (
      <div style={statusContainerStyle}>
        <div style={circleStyle}></div>
        <span style={textStyle}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
    );
  };
  // Helper function to convert style object to a string (if needed)
  const styleString = (styleObject) => {
    return Object.entries(styleObject)
      .map(([key, value]) => `${key}:${value}`)
      .join(';');
  };
  
  // AG Grid column definitions
  const [columnDefs] = useState([
    { headerName: "Username", field: "Username", sortable: true, filter: true },
    { headerName: "Surname", field: "Surname", sortable: true, filter: true },
    { headerName: "Email", field: "Email", sortable: true, filter: true },
    { headerName: "Access Date", field: "Dashboardaccessdate", sortable: true, filter: true },
    { headerName: "User Role", field: "Accesstype", sortable: true, filter: true },
    { headerName: "Status", field: "Userstatus", sortable: true, filter: true, cellRenderer: statusButtonRenderer },
    { headerName: "Update", cellRenderer: editButtonRenderer },
  ]);
  
  
  const networks = Object.keys(networkAccounts);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => {
      const updatedData = { ...prevData, [name]: value };

      if (name === "Username") {
        updatedData.Email = value + "@dinjitgrid.com";
      }

      if (name === "networkname") {
        // Add logic for handling account holders based on selected network
        const holders = Object.keys(networkAccounts[value] || {});
        // console.log("Selected Network:", value, "Holders:", holders); // Debugging log
        setAccountHolders(holders);
        setAccountNumbers([]);
        updatedData.accountholdername = '';
        updatedData.accountnumber = '';
      }

      if (name === "accountholdername") {
        // Add logic for handling account numbers based on selected account holder
        const numbers = networkAccounts[formData.networkname]?.[value] || [];
        setAccountNumbers(numbers);
        updatedData.accountnumber = '';
      }

      return updatedData;
    });
  };

  const handleAddNetwork = () => {
    // Add a new empty network object to the networks array
    setFormData((prevData) => ({
      ...prevData,
      networks: [...prevData.networks, { networkname: '', accountholdername: '', accountnumber: '' }]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = {
      Username: formData.Username,
      Surname: formData.Surname,
      Email: formData.Email,
      Password: formData.Password,
      Dashboardaccessdate: formData.Accessdate,
      Accesstype: formData.Typeofaccess,
      Userstatus: formData.Userstatus,
      Buyercode: typeof formData.Buyercode === 'string' && formData.Buyercode.length > 0
        ? formData.Buyercode.split(',').map(code => code.trim())
        : formData.Buyercode || [],
      adAccounts: formData.networks.reduce((acc, network) => {
        if (!acc[network.networkname]) {
          acc[network.networkname] = {};
        }
        if (!acc[network.networkname][network.accountholdername]) {
          acc[network.networkname][network.accountholdername] = [];
        }
        acc[network.networkname][network.accountholdername].push(...network.accountnumber);
        return acc;
      }, {})
    };


    console.log(result, "test");



    try {
      const response = await fetch("/api/ecreateapi", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(result)
      });

      if (response.ok) {
        const responseData = await response.json();
        alert('User added successfully!');
        fetchUserData(); // Refetch user data to update the grid
        window.location.href = '/Ecreate'; 
      } else {
        console.error('Error submitting data:', response.statusText);
        alert('Failed to submit the user data.');
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('An error occurred while submitting the data.');
    }
  };

  const handleupdateSubmit = async (e) => {
    e.preventDefault();


    // Prepare the result object for the update
    const result = {
      Username: formData.Username, // Keep Username for identification
      Surname: formData.Surname,
      Email: formData.Email,
      Password: formData.Password,
      Dashboardaccessdate: formData.Accessdate,
      Typeofaccess: formData.Typeofaccess,
      Userstatus: formData.Userstatus,
      Buyercode: typeof formData.Buyercode === 'string'
        ? formData.Buyercode.split(',').map(code => code.trim())
        : formData.Buyercode, // Handle it as is if it's already an array
      adAccounts: formData.networks.reduce((acc, network) => {
        // Ensure nested objects are created correctly
        if (!acc[network.networkname]) {
          acc[network.networkname] = {};
        }
        if (!acc[network.networkname][network.accountholdername]) {
          acc[network.networkname][network.accountholdername] = [];
        }
        // Push account numbers into the correct holder
        acc[network.networkname][network.accountholdername].push(...network.accountnumber);
        return acc;
      }, {})
    };

    try {
      const response = await fetch(`/api/eupdate`, {
        method: 'PUT', // Use PUT for updates
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(result) // Send the entire result object
      });

      if (response.ok) {
        const responseData = await response.json();
        alert('User updated successfully!');
        fetchUserData(); // Refetch user data to update the grid
        // resetForm(); // Reset form after submission
        window.location.href = '/Ecreate'; 
      } else {
        // Enhanced error handling
        const errorData = await response.json(); // Get error message from response
        console.error('Error submitting data:', errorData.message);
        alert(`Failed to submit the user data: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('An error occurred while submitting the data.');
    }
  };




  const handleEdit = async (userData) => {

    // Update form data with the selected user data
    const networksData = userData.adAccounts
      ? Object.keys(userData.adAccounts).flatMap(networkName => {
        return Object.keys(userData.adAccounts[networkName]).map(accountHolder => ({
          networkname: networkName,
          accountholdername: accountHolder,
          accountnumber: userData.adAccounts[networkName][accountHolder] || []
        }));
      })
      : [];

    setFormData({
      Username: userData.Username || '',
      Surname: userData.Surname || '',
      Email: userData.Email || '',
      Password: userData.Password || '', // For security reasons, leave password empty
      Accesstype: userData.Accesstype || '',
      Dashboardaccessdate: userData.Dashboardaccessdate || '',
      Userstatus: userData.Userstatus === 'Active' || userData.Userstatus === 'Inactive' 
      ? userData.Userstatus 
      : '', 
      networks: networksData, // Set networks data
  
      Buyercode: userData.Buyercode || '',
    });

    // Open the offcanvas manually
    const offcanvasElement = document.getElementById('updateoffcanvasExampleuser');
    // const bsOffcanvas = new bootstrap.Offcanvas(offcanvasElement);
    // bsOffcanvas.show();
  };

  // Function to handle network name change
  const handleNetworkChange = (index, selectedOption) => {
    const newNetworks = [...formData.networks];
    newNetworks[index].networkname = selectedOption ? selectedOption.value : '';

    // Fetch account holders based on the selected network
    const holders = Object.keys(networkAccounts[selectedOption.value] || {});
    setAccountHolders(holders);
    setAccountNumbers([]); // Reset account numbers

    setFormData({ ...formData, networks: newNetworks });
  };

  // Function to handle account holder change
  const handleAccountHolderChange = (index, selectedOption) => {
    const newNetworks = [...formData.networks];
    newNetworks[index].accountholdername = selectedOption ? selectedOption.value : '';

    const numbers = networkAccounts[newNetworks[index].networkname]?.[selectedOption.value] || [];
    setAccountNumbers(numbers);
    newNetworks[index].accountnumber = numbers; // Set account numbers corresponding to the selected account holder

    setFormData({ ...formData, networks: newNetworks });
  };

  // Function to handle account number change
  const handleAccountNumberChange = (index, selectedOptions) => {
    const newNetworks = [...formData.networks];
    newNetworks[index].accountnumber = selectedOptions ? selectedOptions.map(option => option.value) : []; // Collect multiple account numbers
    
    setFormData({ ...formData, networks: newNetworks });
  };
  return (
    <>
      <Navigation toggleSidebar={toggleSidebar} sidebarToggled={sidebarToggled} />
      <div className="content-holder">

        <div className="topbar">
          <Tbar toggleSidebar={toggleSidebar} />
        </div>

        <div className="container-fluid pt-3">
          <div className="page-head-handler float-end">
            <h2>User List</h2>
            <button className="btn btn-primary btn-sm" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExampleuser" aria-controls="offcanvasExample">
              Add User
            </button>
          </div>



          <div className="offcanvas offcanvas-end" id="offcanvasExampleuser" aria-labelledby="offcanvasExampleLabel">
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="offcanvasExampleLabel">Create a user</h5>
              <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">
              <form onSubmit={handleSubmit}>
                <div className="card custom-card">
                  <div className="card-body">
                    <div className="row gy-3">
                      <div className="col-xl-6">
                        <label className="form-label">User Name</label>
                        <input
                          type="text"
                          className="form-control"
                          name="Username"
                          value={formData.Username}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-xl-6">
                        <label className="form-label">Surname</label>
                        <input
                          type="text"
                          className="form-control"
                          name="Surname"
                          value={formData.Surname}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-xl-6">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          name="Email"
                          value={formData.Email}
                          readOnly
                        />
                      </div>
                      <div className="col-xl-6">
                        <label className="form-label">Password</label>
                        <input
                          type="password"
                          className="form-control"
                          name="Password"
                          value={formData.Password}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-xl-6">
                        <label className="form-label">Access Date</label>
                        <input
                          type="date"
                          className="form-control"
                          name="Accessdate"
                          value={formData.Accessdate}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-xl-6">
                        <label className="form-label">User Role</label>
                        <select
                          className="form-select"
                          name="Typeofaccess"
                          value={formData.Typeofaccess}
                          onChange={handleChange}
                        >
                          <option value="">Select Role</option>
                          <option value="SuperAdmin">SuperAdmin</option>
                          <option value="Admin">Admin</option>
                          <option value="Employee">Employee</option>
                        </select>
                      </div>



                      <div className="col-xl-6">
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          name="Userstatus"
                          value={formData.Userstatus}
                          onChange={handleChange}
                        >
                          <option value="">Select Status</option>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>

                      <div className="col-xl-6">
                        <label className="form-label">Buyer code</label>
                        <input
                          type="text"
                          className="form-control"
                          name="Buyercode"
                          value={formData.Buyercode || ''}
                          onChange={handleChange}
                        />
                      </div>

                      {/* Render networks dynamically */}
                      {Array.isArray(formData.networks) && formData.networks.map((network, index) => (
                        
                        <div className="col-xl-12" id="form-network-select" key={index}>
                         
                          <div className="row">
                            <div className="col-xl-4">
                              <label className="form-label">Network Name</label>
                              <Select
                                options={networks.map(networkName => ({ value: networkName, label: networkName }))}
                                name="networkname"
                                className="basic-single-select"
                                classNamePrefix="select"
                                value={network.networkname ? { value: network.networkname, label: network.networkname } : null}
                                onChange={(selectedOption) => {
                                  const newNetworks = [...formData.networks];
                                  newNetworks[index].networkname = selectedOption ? selectedOption.value : "";
                                  setFormData({ ...formData, networks: newNetworks });
                                  handleChange({ target: { name: "networkname", value: selectedOption ? selectedOption.value : "" } });
                                }}
                              />
                            </div>
                            <div className="col-xl-4">
                              <label className="form-label">Account Holder Name</label>
                              <Select
                                options={accountHolders.map(holder => ({ value: holder, label: holder }))}
                                name="accountholdername"
                                className="basic-multi-select"
                                classNamePrefix="select"
                                isMulti
                                value={Array.isArray(network.accountholdername) ? network.accountholdername.map(holder => ({ value: holder, label: holder })) : []} // Safe check
                                onChange={(selectedOptions) => {
                                  const newNetworks = [...formData.networks];
                                  newNetworks[index].accountholdername = selectedOptions ? selectedOptions.map(option => option.value) : [];
                                  setFormData({ ...formData, networks: newNetworks });
                                  handleChange({
                                    target: { name: "accountholdername", value: selectedOptions ? selectedOptions.map(option => option.value) : [] }
                                  });
                                }}
                              />
                            </div>
                            <div className="col-xl-4">
                              <label className="form-label">Account Numbers</label>
                              <Select
                                isMulti
                                options={accountNumbers.map(number => ({ value: number, label: number }))}
                                name="accountnumber"
                                className="basic-multi-select"
                                classNamePrefix="select"
                                onChange={(selectedOptions) => {
                                  const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
                                  const newNetworks = [...formData.networks];
                                  newNetworks[index].accountnumber = selectedValues;
                                  setFormData({ ...formData, networks: newNetworks });
                                }}
                                value={Array.isArray(network.accountnumber) ? network.accountnumber.map(number => ({ value: number, label: number })) : []} // Safe check
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="col-xl-6">
                        <button type="button" className="btn btn-secondary" onClick={handleAddNetwork}>
                          Add Another Network
                        </button>
                      </div>
                      <div className="col-xl-6 text-end">
                        <button type="submit" className="btn btn-primary ">Submit</button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>


          

          <div className="offcanvas offcanvas-start" id="updateoffcanvasExampleuser" aria-labelledby="offcanvasExampleLabel">
                        <div className="offcanvas-header">
                            <h5 className="offcanvas-title" id="offcanvasExampleLabel">Update user</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                        </div>
                        <div className="offcanvas-body">
                            <form onSubmit={handleupdateSubmit}>
                                <div className="row">
                                    <div className="col-xl-6">
                                        <label className="form-label">Username</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="username"
                                            value={formData.Username}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-xl-6">
                                        <label className="form-label">Surname</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="surname"
                                            value={formData.Surname}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-xl-6">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            value={formData.Email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-xl-6">
                                        <label className="form-label">Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            name="password"
                                            value={formData.Password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-xl-6">
                                        <label className="form-label">Access Type</label>
                                        <select className="form-select" name="typeofaccess" value={formData.Accesstype} onChange={handleChange}>
                                            <option value="">Select Role</option>
                                            <option value="SuperAdmin">SuperAdmin</option>
                                            <option value="Admin">Admin</option>
                                            <option value="Employee">Employee</option>
                                        </select>
                                    </div>
                                    <div className="col-xl-6">
                                        <label className="form-label">Access Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="accessdate"
                                            value={formData.Dashboardaccessdate}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-xl-6">
                                        <label className="form-label">User Status</label>
                                        <select className="form-select" name="Userstatus" value={formData.Userstatus} onChange={handleChange}>
                                            <option value="">-- Select --</option>
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>


                                    <div className="col-xl-6">
                                                <label className="form-label">Buyer code</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="buyercode"
                                                    value={formData.Buyercode}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                    <div className="col-12 mt-4">
                                        <h5>Networks</h5>
                                        {formData.networks.map((network, index) => (
                                            <div key={index} className="row gy-3 align-items-end">
                                                <div className="col-xl-4">
                                                    <label className="form-label">Network Name</label>
                                                    <Select
                                                        options={networks.map((network) => ({ value: network, label: network }))}
                                                        value={network.networkname ? { value: network.networkname, label: network.networkname } : null}
                                                        onChange={(selectedOption) => handleNetworkChange(index, selectedOption)}
                                                    />
                                                </div>
                                                <div className="col-xl-4">
                                                    <label className="form-label">Account Holder Name</label>
                                                    <Select
                                                        options={accountHolders.map((holder) => ({ value: holder, label: holder }))}
                                                        value={network.accountholdername ? { value: network.accountholdername, label: network.accountholdername } : null}
                                                        onChange={(selectedOption) => handleAccountHolderChange(index, selectedOption)}
                                                    />
                                                </div>
                                                <div className="col-xl-4">
                                                    <label className="form-label">Account Number(s)</label>
                                                    <Select
                                                        options={accountNumbers.map((number) => ({ value: number, label: number }))}
                                                        isMulti
                                                        value={(Array.isArray(network.accountnumber) ? network.accountnumber : []).map((num) => ({
                                                            value: num,
                                                            label: num,
                                                        }))}
                                                        onChange={(selectedOptions) => handleAccountNumberChange(index, selectedOptions)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                </div>

                                <div className="row mt-4">
                                    <div className="col-xl-6">
                                        <button type="button" className="btn btn-secondary " onClick={handleAddNetwork}>
                                            Add Network
                                        </button>
                                    </div>
                                    <div className="col-xl-6">
                                        <div className="text-center">
                                            <button className="btn btn-primary float-end" type="submit">Submit</button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

          <div className="card">
            <div className="card-body" id="dataholdlist">
              <div className="ag-theme-alpine" style={{ height: "80vh", width: "100%" }}>
                <AgGridReact
                  rowData={rowData}
                  columnDefs={columnDefs}
                  pagination={true}
                  paginationPageSize={20}
                  defaultColDef={{
                    flex: 1,
                    minWidth: 150,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
