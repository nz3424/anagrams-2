import { useState, useEffect } from "react";
import Card from "../Card";
import Cookies from "universal-cookie";
import "./friends-card.css";

const FriendsCard = ({ friends, requests }) => {
    console.log("Requests: ", requests);
    const [isFriendView, setIsFriendView] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [friendSearch, setFriendSearch] = useState("");
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event && event.key === "Enter") {
                addFriend(friendSearch);


            }
        }
        window.addEventListener("keydown", handleKeyDown);
        handleKeyDown();
        return () => window.removeEventListener("keydown", handleKeyDown);
    }
    );
    const addFriend = (username) => {
        console.log("Adding friend: ", username);
        const cookies = new Cookies();
        //* add backend logic: make a post request to server to add friend
        fetch("http://localhost:3001/friend-request", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                authorization: `Bearer ${cookies.get("token")}`, // this might be wrong
            },
            body: JSON.stringify({ username })
        }).then(res => {
            console.log("Response from server: ", res);
            if (!res.ok) throw new Error(`Failed to send friend request: ${res.json().error}`);

            alert("Friend request sent"); // make this better 
            // clear input field if successful
            setFriendSearch("");
            return res.json();
        }).catch(error => {
            console.error("Error sending friend request: ", error);
            alert("Failed to send friend request");
        })
    }

    const acceptRequest = (requester_name) => {
        console.log("Accepting request from: ", requester_name);
        // backend logic to accept friend request
    }
    const content =
        <div className="friends-container">
            <div className="friends-header">
                <p className="friends-text">Manage friends and challenges</p>
                <button onClick={() => setModalOpen(true)}>Add friends</button>
            </div>

            <div className="friends-body">
                <div className="toggle-container">
                    <button className={isFriendView ? "clicked-toggle" : "unclicked-toggle"} onClick={() => setIsFriendView(true)}>Friends</button>
                    <button className={isFriendView ? "unclicked-toggle" : "clicked-toggle"} onClick={() => setIsFriendView(false)}>Requests</button>
                </div>
                <div className="friends-list">
                    {isFriendView ?
                        (friends && friends.length > 0 ? friends.map((friend, index) => (
                            <p key={index} className="friends-text">{friend}</p>
                        )) : <p className="friends-text">You have no friends added</p>)
                        :
                        (requests && requests.length > 0 ? requests.map((request, index) => (
                            <div key={index} className="friend-request">
                                <p className="friends-text">{request.requester_name}</p>
                                <div className="friend-request-buttons">
                                    <button onClick={() => { acceptRequest }}>Accept</button>
                                    <button>Decline</button>
                                </div>
                            </div>
                        )) : <p className="friends-text">You have no pending requests</p>)
                    }
                </div>
            </div>
        </div>
    return (
        <>
            <Card
                title="Friends"
                content={content}
            />
            {modalOpen &&
                <div>
                    <dialog open onClose={() => setModalOpen(false)} className="friends-dialog">
                        <div className="top-row">
                            <p>Add friend</p>
                            <button className="modal-close" onClick={() => setModalOpen(false)}>X</button>
                        </div>

                        <div className="input-container">
                            <input className="friends-input" type="text" placeholder="Enter username" value={friendSearch} onChange={(event) => setFriendSearch(event.target.value)}>
                            </input>
                            <button className="friends-button" onClick={() => {
                                addFriend(friendSearch);
                            }}>{">"}</button>
                        </div>
                    </dialog>
                    <div className="overlay" onClick={() => {
                        setModalOpen(false);
                    }} />
                </div>}
        </>

    )
}

export default FriendsCard