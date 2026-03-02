import { Link } from "react-router-dom"
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./footer.css"

export default function Footer () {

    return <div className="footer">
        <div className="first-block">
            <div className="about-me">
                <div className="abm">
                    <a
                     className="shoper"
                     href="#"
                    >
                        <img src="./crayfish.jpg" alt="cryfish" width="54px"/>
                        <p className="shop">Cray</p>Fish
                    </a>
                    <div className="about-text">
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Et at velit animi, adipisci rerum necessitatibus inventore fugit, quaerat nobis tempore enim suscipit! Id distinctio neque rerum nulla sint doloribus vero.
                    </div>
                </div>
            </div>
            <div className="contacts-social">
                <div className="contacts">
                    <p>Contacts</p>
                    <ul>
                        <a href="tell:+374-93-81-60-09">+374-93-81-60-09</a>
                        <a href="tell:+374-94-46-80-09">+374-94-46-80-09</a>
                        <a href="mailto:hovhannesabgaryn1@gmail.com">hovhannesabgaryn1@gmail.com</a>
                    </ul>
                </div>
                <div className="social">
                    <p>Social Networks</p>
                    <ul>
                        <a href="#"><i className="fa-brands fa-facebook-f"></i></a>
                        <a href="#"><i className="fa-brands fa-instagram"></i></a>
                        <a href="#"><i className="fa-brands fa-telegram"></i></a>
                        <a href="#"><i className="fa-brands fa-whatsapp"></i></a>
                    </ul>
                </div>
            </div>
        </div>
        <div>
            REMONT!!
        </div>
    </div>
}