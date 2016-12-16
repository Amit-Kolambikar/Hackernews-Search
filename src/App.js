import React from 'react';
import './App.css';
const DEFAULT_QUERY = 'react';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const DEFAULT_PAGE = 0;
const PARAM_PAGE = 'page=';
export default class App extends React.Component {
  constructor() {
    super()
    this.state = {
      result: null,
      repeatSearchTerm: true,
      emptyState: true,
      query: DEFAULT_QUERY,
    }
    this.onSearchChange = this.onSearchChange.bind(this);
    this.setSearchTopstories = this.setSearchTopstories.bind(this);
    this.fetchSearchTopstories = this.fetchSearchTopstories.bind(this);
    this.navigatePage = this.navigatePage.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
  }
  setSearchTopstories(result) {
    const {hits, page} = result;
    const oldHits = page === 0 ? [] : this.state.result.hits;
    const updatedHits = [...oldHits, ...hits];
    if (updatedHits.length === 0) {
      this.setState({
        repeatSearchTerm: true,
        emptyState: true
      });
    } else {
      this.setState({
        result: {
          hits: updatedHits,
          page
        },
        emptyState: false
      });
    }
  }
  onSearchSubmit() {
    if (!this.state.repeatSearchTerm)
      this.fetchSearchTopstories(this.state.query, DEFAULT_PAGE);
  }
  fetchSearchTopstories(query, page) {
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${query}&hitsPerPage=7&${PARAM_PAGE}${page}`)
      .then(response => response.json())
      .then(result => this.setSearchTopstories(result));
  }
  componentDidMount() {
    const {query} = this.state;
    this.fetchSearchTopstories(query, DEFAULT_PAGE);
  }
 // componentWillReceiveProps(nextProps) {
//   console.log("componentWillReceiveProps-->", nextProps, this.state)
// }
// componentWillUpdate(nextProps, nextState) {
//   console.log("componentWillUpdate-->", nextProps, nextState, this.state)
// }
// componentDidUpdate(prevProps, prevState) {
//   console.log("componentDidUpdate-->", prevProps, prevState, this.state)
// }
  onSearchChange(event) {
    if (this.state.query !== event.target.value) {
      this.setState({
        query: event.target.value,
        repeatSearchTerm: false
      });
    } else {
      this.setState({
        repeatSearchTerm: true
      });
    }
  }
  navigatePage(page) {
    if (page <= 0)
      return;
    if (page !== this.state.page) {
      if (!this.state.emptyState)
        this.fetchSearchTopstories(this.state.query, page)
    }
    else
      return;
  }
  render() {
    const {query, result, emptyState} = this.state;
    const page = (result && result.page) || 0;
    return (
      <div className="App">
        <Search
                value={ query }
                onChange={ this.onSearchChange }
                onSearchSubmit={ this.onSearchSubmit } />
        { result ? <Table
                          list={ result.hits }
                          pattern={ query }
                          emptyState={ emptyState } /> : <Loading /> }
        <div className="prev-next-block">
          <button
                  type="button"
                  className="next"
                  onClick={ () => this.navigatePage(page + 1) }>
            More
          </button>
        </div>
      </div>
      );
  }
}
const Loading = () => (<h3 style={ { textAlign: 'center', margin: '200px auto' } }>Loading...</h3>);

class Search extends React.Component {
  onSearchSubmit(event) {
    event.preventDefault()
    this.props.onSearchSubmit()
  }
  render() {
    const {value, onChange, children} = this.props;
    return (
      <form
            onSubmit={ (event) => this.onSearchSubmit(event) }
            className="search-form">
        { children }
        <input
               type="text"
               value={ value }
               onChange={ onChange }
               onFocus={ this.value = this.value } />
        <button type="submit">
          Submit
        </button>
      </form>
      );
  }
}
class Table extends React.Component {
  render() {
    function isSearched(query) {
      return function(item) {
        return !query || item.title.toLowerCase().indexOf(query.toLowerCase()) !== -1;
      }
    }

    const {list, pattern, emptyState} = this.props;
    if (emptyState) {
      return (<h3 style={ { textAlign: 'center', margin: '200px auto' } }>Please update your search term</h3>)
    } else {
      return (
        <div className="table">
          <div className="table-row">
            <span style={ { width: '40%', color: 'blue' } }><a
                                                href=""
                                                disabled
                                                style={ { color: 'blue' } }>Title</a></span><span style={ { width: '30%', textAlign: 'center', color: 'blue' } }>Author</span><span style={ { width: '15%', color: 'blue', textAlign: 'center' } }>Comments</span>
            <span style={ { width: '15%', color: 'blue', textAlign: 'center' } }>Points</span>
          </div>
          { list.filter(isSearched(pattern)).map((item) => <div
                                                                key={ item.objectID }
                                                                className="table-row">
                                                             <span style={ { width: '40%' } }><a href={ item.url }>{ item.title }</a></span>
                                                             <span style={ { width: '30%', 'textAlign': 'center' } }>{ item.author }</span>
                                                             <span style={ { width: '15%', textAlign: 'center' } }>{ item.num_comments }</span>
                                                             <span style={ { width: '15%', textAlign: 'center' } }>{ item.points }</span>
                                                           </div>
            ) }
        </div>
        );
    }
  }
}
