import React,{useState, useEffect} from 'react'

import './App.css';
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt';
import DeleteIcon from '@material-ui/icons/Delete';
import Select from 'react-select'
import makeAnimated from 'react-select/animated';


const data = require('./database/movies')

function App() {

  const [movies, setMovies] = useState([])
  const [liked, setLiked] = useState([])
  const [disliked, setDisliked] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [offest, setOffest] = useState(0)
  const [limit, setLimit] = useState(12)
  
  useEffect(() =>{
    data.movies$.then((response) =>{
      if(response){
        setMovies(response)
        getAllCategories(response)
      }
    })
  },[])

  const getAllCategories = (response) =>{   // get all available categories
    var tmp = []
    for (const movie of response) {
      if(!tmp.some(item=> item.value === movie.category)){
        tmp = [...tmp, {value :movie.category, label: movie.category}]
      }
    }
    setCategories(tmp)
  }

  const onDeleteHandler = (e,movie)=>{    // i could use map index and delete the movie directly but i prefer use filter
      const tmp = movies.filter(item => item.id !== movie.id)
      setMovies(tmp)
      getAllCategories(tmp)
  }

  const onLikeHandler = (movie)=>{       // function get trigred once the like button clicked
    var tmp = [...movies]
    if(liked.includes(movie)){
      setLiked(liked.filter(item=> item.id !== movie.id))
      tmp[tmp.indexOf(movie)].likes--
      setMovies(tmp)
    }else{
      setLiked([...liked, movie])
      tmp[tmp.indexOf(movie)].likes++
      if(disliked.includes(movie)){
        setDisliked(disliked.filter(item => item.id !== movie.id))
        tmp[tmp.indexOf(movie)].dislikes--
      }
      setMovies(tmp)
    }
  }

  const onDisLikeHandler = (movie)=>{  // function get trigred once the dislike button clicked
    var tmp = [...movies]
    if(disliked.includes(movie)){
      setDisliked(disliked.filter(item=> item.id !== movie.id))
      tmp[tmp.indexOf(movie)].dislikes--
      setMovies(tmp)
    }else{
      setDisliked([...disliked, movie])
      tmp[tmp.indexOf(movie)].dislikes++
      if(liked.includes(movie)){
        setLiked(liked.filter(item => item.id !== movie.id))
        tmp[tmp.indexOf(movie)].likes--
      }
      setMovies(tmp)
    }
  }

  const onSelectionChange = (event) => {  // function get trigred once category selection change
    setSelectedCategories(event)
    setOffest(0);
  }

  const onNextHandler = (event) => {    // function get trigred once suivant button clicked
    var tmp = offest+Math.min(getSelectedMovies().length-offest,limit);
    if(tmp<= getSelectedMovies().length-1){
      setOffest(tmp) 
    }
  }


  const onPreviousHandler = (event) => { // function get trigred once précédent button clicked
    var tmp = offest-limit;
    if(tmp>=0){
      setOffest(tmp) 
    }
  }

  const onChangePaginate = (event) => {  // function get trigred once the limit choice changes
    setLimit(event.value)
    setOffest(0);
  }

  const getSelectedMovies=()=>{    // get all movies in selected categories
    if(selectedCategories.length===0){
      return movies;
    }
    var selectedMovies =[]
    for(const movie of movies){
      if(selectedCategories.some((category) => category.value===movie.category)){
        selectedMovies.push(movie);
      }
    }
    return selectedMovies
  }

  const displayCards = () =>{   // diplay all movies
      return getSelectedMovies().slice(offest,offest+limit).map((movie, index)=>{
          return (<div key={movie.id} className="card">
                  <div className="card-header">
                        <h2>{movie.title}</h2>
                        <DeleteIcon className="delete-icon" onClick={(e)=>{onDeleteHandler(e,movie)}}/>
                  </div>
                  <div className="card-body">
                      <img alt= {movie.title} src={`https://picsum.photos/seed/${movie.id}/200/200`} />
                  </div>
                  <div className="card-footer">
                      <div className="card-footer-likes">
                          <div>
                            <ThumbUpAltIcon onClick={() =>{onLikeHandler(movie)}} className={"icon " + (liked.includes(movie) ? "active": "" )}/>
                            <p>{movie.likes} likes</p>
                          </div>
                          <div>
                            <ThumbUpAltIcon onClick={() =>{onDisLikeHandler(movie)}} className={"icon dislike " + (disliked.includes(movie) ? "active": "" )}/>
                            <p>{movie.dislikes} dislikes</p>
                          </div>
                      </div>
                      <div className="card-footer-category">
                            <h5>{movie.category}</h5>
                      </div>
                  </div>
              </div>)
      })
  }

  const choicesPagination = [{value:4, label:4}, {value:8, label:8} , {value:12, label:12}]
  
  return (
    <div className="App">
      <div className="section select-cantainer">
        <Select components={makeAnimated()} isMulti options={categories} onChange={onSelectionChange}/>
      </div>
      <div className="section info-paginate">
        <div>{Math.floor(offest/limit)+1}/{(Math.floor((getSelectedMovies().length-1)/limit))+1}</div>
        <div className= "choice-paginate">
          <Select options={choicesPagination} defaultValue={choicesPagination[2]} onChange={onChangePaginate}/>
        </div>
      </div>
      <div className="section cards-cantainer">
        {displayCards()}
      </div>
      <div className="section paginate-cantainer"> 
        <div className={offest-limit<0 ? "disabled" : ""} onClick={onPreviousHandler}>Précédent </div>
        <div className={offest+limit>getSelectedMovies().length-1 ? "disabled" : ""} onClick={onNextHandler}> Suivant </div>
      </div>
    </div>
  );
}

export default App;
