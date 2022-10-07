import { useState } from "react"
import axios from "axios"

export default function posts(){
    const [posts, setPosts] = useState([])
    const [errorMessage, setErrorMessage] = useState("")
    


    useEffect(() => {
        const getPosts = async () => {
            try{
                const response = await axios.get("http://localhost:3000/api/v1/posts")
                setPosts(response.data)
            }catch(err){
                setErrorMessage(err.message)

            }
        }
        getPosts()
},[])

const renderPosts = posts.map((post) => {
    return (
        <div key={post.id}>
            <img src={post.image_url} alt={post.title}/>
            <h1>{post.title}</h1>
            <p>{post.content}</p>
            <p>{post.user_Id}</p>
            <p>{post.comment}</p>
            <p>{post.likes}</p>
        </div>
    )

})
    return(
        <div>
            <h1>Posts</h1>
            {renderPosts}
        </div>
    )
}