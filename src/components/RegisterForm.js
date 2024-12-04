import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/useAuth";

const RegisterForm = (props) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    // The form will cause a refresh by default. We don't want that, because our state will disappear.
    e.preventDefault();

    axios
      .post(`https://fed-medical-clinic-api.vercel.app/register`, form)
      .then((res) => {
        console.log(res);

        localStorage.setItem("user", JSON.stringify(res.data.user));

        login(form.email, form.password);

        navigate("/");
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form>
      <input
        onChange={handleChange}
        value={form.first_name}
        type="text"
        name="first_name"
        placeholder="Joe"
      ></input>
      <br />
      <input
        onChange={handleChange}
        value={form.last_name}
        type="text"
        name="last_name"
        placeholder="Bloggs"
      ></input>
      <br />
      <input
        onChange={handleChange}
        value={form.email}
        type="email"
        name="email"
        placeholder="joe.bloggs@email.com"
      ></input>
      <br />
      <input
        onChange={handleChange}
        value={form.password}
        type="password"
        name="password"
      ></input>
      <br />
      <button onClick={handleSubmit}>Submit</button>
    </form>
  );
};

export default RegisterForm;
