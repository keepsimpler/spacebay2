import React, {Component} from 'react';
import AppUtils from '../util/AppUtils';
import '../css/components/blogPost.css';

class BlogPostSummary extends Component {

    constructor(props) {
        super(props);
        let foundTopics = props.topics.filter(function (topic) {
            return (props.post.topic_ids.indexOf(topic.id) > -1);
        });
        this.state = {
            post: props.post ? props.post : null,
            topics: props.topics ? props.topics : null,
            foundTopics: foundTopics ? foundTopics : null,
            error: null
        };

    }

    getSlug(post){
        if(typeof post.slug!=='undefined' && post.slug){
            return post.slug.split("/").splice(-1);
        }else {
            return post.id;
        }
    }


    render() {

        return (
            <article id={"post-" + this.state.post.id}
                     style={{
                         backgroundImage: 'url(' + (this.state.post.featured_image ? this.state.post.featured_image : '../app-images/blog-article.jpg')  + ')',
                     }}
                     className="post-item" onClick={(event)=>window.location.href="/blog/" + this.getSlug(this.state.post)}>

                <div className="overlay"/>

                <div className="title title--center">
                    <div>
                        {this.state.foundTopics && this.state.foundTopics.length > 0 ?
                            <h5><a className="topic-link"
                                   href={"/blog/" + this.getSlug(this.state.post)}
                                   rel="category tag">{this.state.foundTopics[0].name}</a></h5>
                            :
                            null
                        }

                        <a className="titleLink" href={"/blog/" + this.getSlug(this.state.post)}>
                            <h2 className="entry-title">{this.state.post.title.substring(0,80)}</h2>
                        </a>
                        <div className="underline desktop-only"/>
                        <ul className="post-meta-alt desktop-only">
                            <li><span className="entry-date">{AppUtils.timeConverter(this.state.post.publish_date)}</span>
                            </li>

                            <li/>

                        </ul>
                    </div>
                </div>


            </article>
        )
    }
}


export default BlogPostSummary;
