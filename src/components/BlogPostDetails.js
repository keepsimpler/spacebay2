import React, {Component} from 'react';
import 'css/components/blogPost.css';
import AppUtils from '../util/AppUtils';
import {Helmet} from "react-helmet";


class BlogPostDetails extends Component {

    constructor(props) {
        super(props);

        let foundTopics = props.topics.filter(function (topic) {
            if (!props.post.topic_ids) return false;
            return (props.post.topic_ids.indexOf(topic.id) > -1);
        });
        this.state = {
            post: props.post ? props.post : null,
            topics: props.topics ? props.topics : null,
            foundTopics: foundTopics ? foundTopics : null,
            error: null
        };

    }

    getTitle(title){
        let newTitle="";
        if(title){
            let tempArray=title.split(" ");
            for(let i=0;i<tempArray.length;i++){
                if(newTitle.length+tempArray[i].length >60){
                    break;
                }else{
                    newTitle+=tempArray[i]+" ";
                }
            }
        }
        return newTitle;
    }


    render() {
        return (
            <div className="blog-post-single w100 pull-left">
                {this.state.post ?
                    <div>
                        <Helmet>
                            <title>{this.getTitle(this.state.post.title)}</title>
                            <meta name="keywords" content={'blog '+this.state.post.keywords.join(', ')} />
                            <meta name="description"
                                  content={this.state.post.meta_description}  />
                        </Helmet>
                        <div className="background parallax-bg">
                            <div className="overlay"></div>
                            {
                                this.state.post.featured_image ?
                                    <div className="parallax"
                                         style={{
                                             backgroundImage: 'url(' + this.state.post.featured_image + ')',
                                         }}>

                                    </div>
                                    :
                                    <div className="parallax"
                                         style={{
                                             backgroundImage: 'url(../app-images/blog-article.jpg)',
                                         }}>

                                    </div>
                            }
                            <div className="title-full">
                                <h1>{this.state.post.title.substring(0, 80)}</h1>
                                <ul className="post-meta-alt">
                                    <li><span
                                        className="entry-date">{AppUtils.timeConverter(this.state.post.publish_date)}</span>
                                    </li>
                                    <li></li>
                                </ul>
                            </div>
                            <div className="arrow"></div>
                        </div>

                        <div className="blog-post-content">
                            <div className="container post-header clear">
                                <div className="blog-breadcrumb">
                                    <p><a href="/blog">All posts</a> › {this.state.post.title.substring(0, 80)}</p><p>
                                </p></div>

                                <div className="container content-header text-center">
                                    {this.state.post.blog_post_author.gravatar_url ?
                                        <img alt="" className="avatar"
                                             src={this.state.post.blog_post_author.gravatar_url}/>
                                        :
                                        <img alt="" className="avatar"
                                             src="../app-images/avatar.png"/>
                                    }
                                    <p>by<strong>&nbsp;{this.state.post.blog_post_author.full_name}&nbsp;</strong></p>
                                    <p className="subtitle">posted
                                        on {AppUtils.timeConverter(this.state.post.publish_date)}&nbsp;</p>

                                    <div className="underline underline--dark"></div>

                                </div>
                            </div>
                            <div className="container post-body clear">
                                <p dangerouslySetInnerHTML={{__html: (this.state.post.post_body.replace(/style="white-space:pre-wrap;"/g, ""))}}/>
                            </div>
                            <div className="container blog-post-tags clear">
                                {this.state.foundTopics && this.state.foundTopics.length > 0 ?
                                    <ul>
                                        <li key="label"><strong> Tags :&nbsp;</strong></li>
                                        {this.state.foundTopics.map((topic, index) =>
                                            <li key={index}>
                                                {topic.name}{index !== (this.state.foundTopics.length - 1) ? "," : "."}&nbsp;</li>
                                        )
                                        }
                                    </ul>

                                    :
                                    null
                                }
                            </div>
                        </div>

                    </div>
                    :
                    null}
            </div>
        )
    }
}


export default BlogPostDetails;
