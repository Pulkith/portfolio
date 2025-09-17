import Typed from 'typed.js';
import React, { useState, useEffect, useRef, useReducer } from "react";
import '../CSS/Home.scss'

import { CommonCSS, $, getData } from './Imports';
import { getJSON } from 'jquery';


function Home() {
    /**********************************************
        Functions
    ***********************************************/
    const forceUpdate = useReducer(x => x + 1, 0)[1]

    // Create reference to store the DOM element containing the animation
    const el = React.useRef(null);
    var currentcount = 0

    const clamp = (low, a, high) => {
        if(a < low) return low;
        if(a > high) return high;
        return a;
    }
    /**********************************************
        Constants
    ***********************************************/
        const REG_ZOOM_SPEED = .8;
        let AUTO_ZOOM_SPEED = .1;
        const init_opacity = 5;
        const end_opacity = 20;
    
        const init_photo_opacity = 2;
        const end_photo_opacity = 25;
    
        const zoom_min = 1;
        const zoom_max = 23;

        const auto_zoom_delay = 15;
    
        const rev_deadband = 0.2;
    /**********************************************
        States
    ***********************************************/
        const [zoom, setZoom] = useState(1.0);
        const [goPastLanding, setGoPastLanding] = useState(false);
        const [timer, setTimer] = useState(-1);
        const [runTimer, setRunTimer] = useState(false);
        const [panels_rollover_1_Yvals, update_panels_rollover_1_Yvals] = useState([])

        const [rerender, setRerender] = useState();
        const [afterRender, setAfterRender] = useState();
        
    /**********************************************
        Hooks
    ***********************************************/

    React.useEffect(() => {
    const typed = new Typed(el.current, {
        strings: ['Software Engineer', 'Reseacher', 'Robotics Engineer', 'Entrepreneur', 'Competitive Programmer'],
        typeSpeed: 50,
        backSpeed: 20,
        startDelay: 0,
        loop: true,
        backDelay: 1000,
        onBegin: (self) => {
            if(currentcount++ == 1) {
                self.startDelay = 2400
            } else {
                self.startDelay = 0
            }
        },
    });

    return () => {
        // Destroy Typed instance during cleanup to stop animation
        typed.destroy();
    };
    }, []);

    React.useEffect(() => {
        const handler = (e) => {
            if(zoom < zoom_max) {
                pauseTimer();
                updateZoom(e.deltaY);
            }
            if(zoom >= zoom_max && Math.abs(window.scrollY) < 1 && e.deltaY < -0.2) {
                updateZoom(-1)
            }
            if(zoom >= zoom_max) {
                update_windows_rollover_1();
            }
        }
        document.addEventListener("wheel", handler);
        return () => {document.removeEventListener("wheel", handler)}
    })

    React.useEffect(() => {
        (function ($) {
            $(function () {
          
          
              $(window).on('scroll', function () {
                fnOnScroll();
              });
          
              $(window).on('resize', function () {
                fnOnResize();
              });
          
          
              var agTimeline = $('.js-timeline'),
                agTimelineLine = $('.js-timeline_line'),
                agTimelineLineProgress = $('.js-timeline_line-progress'),
                agTimelinePoint = $('.js-timeline-card_point-box'),
                agTimelineItem = $('.js-timeline_item'),
                agOuterHeight = $(window).outerHeight(),
                agHeight = $(window).height(),
                f = -1,
                agPosY=0,
                agFlag = false;
          
              function fnOnScroll() {
                agPosY = $(window).scrollTop();
          
                fnUpdateFrame();
              }
          
              function fnOnResize() {
                agPosY = $(window).scrollTop();
                agHeight = $(window).height();
          
                fnUpdateFrame();
              }
          
              function fnUpdateWindow() {
                //return if cards haven't loaded yet
                try { const check = agTimelineItem.first().find(agTimelinePoint).offset().top - agTimelineItem.first().offset().top} catch { return }
                agFlag = false;
          
                agTimelineLine.css({
                  top: agTimelineItem.first().find(agTimelinePoint).offset().top - agTimelineItem.first().offset().top,
                  bottom: agTimeline.offset().top + agTimeline.outerHeight() - agTimelineItem.last().find(agTimelinePoint).offset().top
                });
          
                return f !== agPosY && (f = agPosY, agHeight, fnUpdateProgress());
              }
          
              function fnUpdateProgress() {
                var agTop = agTimelineItem.last().find(agTimelinePoint).offset().top;
          
                var i = agTop + agPosY - $(window).scrollTop();
                var a = agTimelineLineProgress.offset().top + agPosY - $(window).scrollTop();
                var n = agPosY - a + agOuterHeight / 2;
                i <= agPosY + agOuterHeight / 2 && (n = i - a);
                agTimelineLineProgress.css({height: n + "px"});
          
                agTimelineItem.each(function () {
                  var agTop = $(this).find(agTimelinePoint).offset().top;
          
                  (agTop + agPosY - $(window).scrollTop()) < agPosY + .5 * agOuterHeight ? $(this).addClass('js-ag-active') : $(this).removeClass('js-ag-active');
                })
              }
          
              function fnUpdateFrame() {
                agFlag || requestAnimationFrame(fnUpdateWindow);
                agFlag = true;
              }
          
          
            });
          })($);
          
    })

    React.useEffect(() => {
        var temp = []
        $.each(panels_rollover_1, function(i, el) {
            temp.push(panels_rollover_1.eq(i).offset().top)
        })
        // console.log(temp)
        update_panels_rollover_1_Yvals(temp)
    }, [goPastLanding])
    
    /**********************************************
        Methods
    ***********************************************/
    function updateZoom(deltaY, ZOOM_SPEED = REG_ZOOM_SPEED) {
        let el = document.getElementById("imagetozoomhome");
        let temp_zoom = zoom;
        temp_zoom += (deltaY > 0) ? ZOOM_SPEED : (deltaY > -.2 ? 0 : -ZOOM_SPEED);
        temp_zoom = Math.max(zoom_min, Math.min(temp_zoom, zoom_max));
        el.style.transform = `scale(${temp_zoom})`
        let opacity = 1 - (zoom - init_opacity) / (end_opacity - init_opacity);
        opacity = clamp(0, opacity, 1)
        $("#introwrapper").css('opacity', opacity)    
        setZoom(temp_zoom)

        setGoPastLanding(temp_zoom >= zoom_max ? true : false)
        if(temp_zoom == zoom_max) {
            if(runTimer){
                setTimeout(() => {
                    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
                    window.scrollTo(0, vh);
                }, 5)
            }
            setRunTimer(false);
        }
        // let photo_opacity = 1 - (zoom - init_photo_opacity) / (end_photo_opacity / init_photo_opacity);
        // photo_opacity = clamp(.5, photo_opacity, 1);

        // let photo_opacity = (zoom - init_photo_opacity) / (end_photo_opacity / init_photo_opacity);
        // photo_opacity = clamp(.3, photo_opacity, 1);
        // $("#imagetozoomhome").css('opacity', photo_opacity);
        // opts.zoom = temp_zoom;
        // var diffFromTop = (zoom - (init_displacement)) / zoom_to_reach_max_displacement * max_displacement;
        // if(zoom < init_displacement) diffFromTop = 0;
        // el.style.top = `-${diffFromTop}px`;
    }

    const loaded =() => {
        //get rid of spinner
    }
    useInterval(() => {
        updateZoom(1, AUTO_ZOOM_SPEED += AUTO_ZOOM_SPEED);
    }, runTimer ? auto_zoom_delay : null);
    function pauseTimer() {
        setRunTimer(false);
    }
    function autozoom() {   
        setRunTimer(true);
    }

    var panels_rollover_1 = $('.panel-rollover-1')
    var _window = $(window);
    function update_windows_rollover_1() {
        var y = _window.scrollTop();
        // console.log(y)
        for(var i = 1, l = panels_rollover_1.length; i < l; i++) {
            if((i === l - 1) || (y >= panels_rollover_1_Yvals[i] && y <= panels_rollover_1_Yvals[i+1]))  {
                panels_rollover_1.not(':eq(' + i + ')').removeClass('panel-rollover-1-fixed');
                panels_rollover_1.eq(i).addClass('panel-rollover-1-fixed');
                // forceUpdate()
                break;
            }
        };
    }
    //INIT LOAD HOOK
    React.useEffect(() => {
        if(!afterRender) return;

        setAfterRender(false);
    }, [afterRender])
    useEffect(() => {
        setAfterRender(true);
    }, [rerender])

    /**********************************************
        Get Data States and Hooks
    ***********************************************/
    const [educationData, setEducationData] = React.useState([])    
    const [experienceData, setExperienceData] = React.useState([])
    React.useEffect(() => {
        getData("education", (data)=> {
            setEducationData(data)
        })

        getData("experience", (data) => {
            data.sort((a, b) => {
                var asplit = a.sortyears.split("-"), bsplit = b.sortyears.split("-");
                if(asplit[1] === 'P') return -1;
                if(bsplit[1] === 'P') return 1;
                if(asplit[1] === bsplit[1]) {
                    return parseInt(asplit[0]) > parseInt(bsplit[0]) ? -1 : 1;
                }
                return parseInt(asplit[1]) > parseInt(bsplit[1]) ? -1 : 1;
            })
            setExperienceData(data)
        })
    }, [])

    /**********************************************
        Body
    ***********************************************/
  return (
    setRerender,
    <div className="HOME ">
        <div className="landingtotal" style={{display: !goPastLanding ? "block" : "none"}}>
            <div className="landingwrapper">
                <div className="imagewrapper">
                    <div className="image" id="imagetozoomhome" >
                    </div>
                </div>
            </div>
            <div className="intowrapperwrapper">
                <div className="introwrapper" id="introwrapper">
                    <div className="HelloItsMeWrapper fadein">
                        Hello, it's me
                    </div>
                    <div className="NameWrapper fadeindelayed">
                        Pulkith Paruchuri<span className="dot">.</span>
                    </div>
                    <div className="IAmAWrapper fadeindelayed2">
                        I am a <span className="underlineWrapper gradtext"><span ref={el} /></span>
                    </div>
                    <div className="jumpingArrowWrapper  hidebounceruntil">
                        <div className="jumpingArrow bounce" onClick={autozoom}>
                            <i className="fa-solid fa-chevron-down actualarrow"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="mainbody" style={{display: goPastLanding ? "block" : "none"}}>
            <div className="aboutmescreen ">
                <div className="">
                    <div className="transitionscreen">
                    
                    </div>
                    <div className="aboutmemainscreen">
                        <div className="maxwidthcenterwrapper">
                            <div className="row mtop50">
                                <div className="col-lg-6 ">
                                    <div className="strikethroughtitlewrapper">
                                        <span className="strikethrough">
                                            <span className="aboutmetitle gradtext gradtextbanner">About Me</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="col-lg-6 spacer"></div>
                                <div className="col-lg-6 ">
                                    <p className="bold900 text350 whitetext spacedLetters005 lineheight70 mright20" style={{marginTop: "50px"}}>
                                        I <span className="buildemphasis">build</span>. From software to robots to healthcare solutions.
                                    </p>
                                </div>
                                <div className="col-lg-6">
                                    <p className="aboutmefulltext bold500 text150 mtop50 mleft20">
                                        Hey! Thanks for stopping by! I'm a student at the University of Pennsylvania (co '26) pursuing a dual degree as part of the Jerome Fisher Program in Management and Technology. I'll be graduating with a degree in Economics from the Wharton School, and with a degree in Computer Science.
                                        <br /><br />
                                        I'm originally from Dallas. As a child I loved to build entire empires from legos. I now have a passion for building things slightly more advanced than legos, like <span className="anchorwrapper"><a href="https://github.com/pulkith" target="_blank">websites & apps</a></span>, <a href="https://coyotronicsfrchhs.wixsite.com/8816" target="_blank">120-pound robots</a>, and a <a href="https://neuro-se.org" target="_blank">startup</a>.
                                        <br /><br />
                                        I also like to build another thing—knowledge.  I have delved deep into research in the computational neuroscience field. Checkout my research papers <a href="https://research.pulkith.com" target="_blank">here</a>. 
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                  
                </div>
            </div>

            {/************************************************************************************************************************************************************************************************
             *                                                                          EDUCATION SECTION
             ************************************************************************************************************************************************************************************************/}
            <div className="educationscreen">
                <div className="maxwidthcenterwrapper">
                    <div className="row">
                        <p className="bold900 text350 whitetext spacedLetters005 lineheight70 mright20" style={{marginTop: "50px"}}>
                            Education
                        </p>
                    </div>
                    <div className="row mtop20">
                        {educationData.map(e =><EducationComponent data={e}></EducationComponent>)}
                    </div>
                </div>
            </div>
            {/************************************************************************************************************************************************************************************************
             *                                                                          EXPERIENCE SECTION
             ************************************************************************************************************************************************************************************************/}
            <div className="experiencescreen">
                <div className="maxwidthcenterwrapper">
                    <div className="row">
                        <div className="ag-timeline-block" style={{marginTop: "10px"}}>
                            <div className="ag-timeline_title-box">
                                <div className="ag-timeline_title whitetext text350 bold900 spacedLetters005 lineheight70">Experience</div>
                            </div>

                            <section className="ag-section">
                                <div className="ag-format-container">
                                    <div className="js-timeline ag-timeline">
                                        <div className="js-timeline_line ag-timeline_line">
                                            <div className="js-timeline_line-progress ag-timeline_line-progress"></div>
                                        </div>
                                        <div className="ag-timeline_list">
                                            {experienceData.map((d, i) => <ExperienceComponent data={d} left={i%2===0} />)}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                 </div>
            </div>

            <div className="experiencescreen">
                <div className="maxwidthcenterwrapper">


                            <div style={{"display": "flex", "alignItems": "center", "flexDirection": "column"}}> 
                                <div className="ag-timeline_title whitetext text350 bold900 spacedLetters005 lineheight70">More to Come</div>
                                <div className="whitetext text175 bold500 spacedLetters005" style={{"textAlign": 'center'}}>
                                    That's it for now! This website was recently started, and is currently a work in progress. Check back here soon for more information about awards, projects, research, and more! 
                                </div>
                            </div>  
                 </div>
            </div>

            







            {/* <div className="awardsscreen">
                <div className="maxwidthcenterwrapper">
                    <div className="row mtop50">
                        <div className="col-lg-6 ">
                            <div className="strikethroughtitlewrapper">
                                <span className="strikethrough">
                                    <span className="aboutmetitle gradtext gradtextbanner">Awards</span>
                                </span>
                            </div>
                        </div>
                        <div className="col-lg-6 spacer"></div>
                    </div>
                </div>
            </div> */}
        </div>
        
    </div>
  );
}

function Li(d, format) {
    if(Array.isArray(d)) {
        return <ul>{d.map(e => Li(e, format))}</ul>
    }
    return <li className={format}>{d}</li>
}

function keyli(d, formattitle, formatlist)  {
    return Object.keys(d).map((e, _) => 
        <div>
            <div className={formattitle}>{e}</div>
            {Li(d[e], formatlist)}
        </div>
    )
}
function arrayli(d, title, formattitle, formatlist) {
    return (<div>
        <div className={formattitle}>{title}</div>
        {Li(d, formatlist)}
    </div>)
}

function getKeys(d, f) {
    return Object.keys(d).map((e, _) => f(e, d[e]))
}

function ia(d, f1, f2="", f3="") {
    if(!Array.isArray(d)) {
        if(f3 == "") {
            return Object.keys(d).map((e, _) => f1(e, d[e]))
        } else {
        }
    } else {
        if(typeof f2 === 'function') {
            return d.map(f2)
        } else {
            return d.map(e => Li(e, f2))
        }
    }
}

/***************************************************************************************************************** 
 * Components
 *************************************************************************************************************** */

function EducationComponent(props) {
    let { data } = props
    return (
        <div className="row mbottom75">
            <div className="col-12 col-md-6 mbottom20">
                <div className="text150 accentcolor bold500">{data.school}</div>
                <div className="text125 whitetext">{data.years}</div>
                <div className="text125 slate">{data.location}</div>
            </div>
            <div className="col-12 col-md-6 text150 timelimetext whitetext">
                <div className="slate">
                     {
                        ia(data.majordescriptions, 
                            (e, d) => 
                                <div>
                                    <div className="text125 bold500 whitetext ">{e}</div>
                                    {Li(d, "text125 lightslate")}
                                </div>
                            ,"text125 whitetext bold500"
                        )
                    }
                </div>
                <div className="activities ">
                {getKeys(data.minordescriptions, (e, d) =>
                    <div>
                        <div className="mtop20 whitetext bold500 text150">{e}</div>
                        {getKeys(d, (name, desc) =>
                                <div className="educationactivity"><ul><li><span className="accentcolor text125 bold500">{name}:</span> <span className="lightslate text125">{desc}</span></li></ul></div>
                        )}
                    </div>
                )}
                </div>

                <div className="coursework">
                    {arrayli(data.coursework, "Relevant Coursework", "text150 zbold500 whitetext mtop20", "lightslate text125")}
                </div>
            </div>
        </div>
    )
}

function ExperienceComponent(props) {
    let { data, left} = props
    return(
        <div className="js-timeline_item ag-timeline_item">
            <div className="ag-timeline-card_box">
            {
                left &&
                (<div className="js-timeline-card_point-box ag-timeline-card_point-box"><div className="ag-timeline-card_point">{}</div></div>)
            }
            <div className="ag-timeline-card_meta-box">
                <div className="ag-timeline-card_meta"><span className="actualcompanyname">{data.company}</span></div>
            </div>
            {
                !left &&
                (<div className="js-timeline-card_point-box ag-timeline-card_point-box"><div className="ag-timeline-card_point"></div></div>)
            }
            </div>
            <div className="ag-timeline-card_item">
                <div className="ag-timeline-card_inner">
                    <div className="ag-timeline-card_img-box">
                        <img src={data.image} className="ag-timeline-card_img" width="640" height="360" alt={data.comapny + " image"} />
                        <div className="image_experience_cover" style={{height: "360px"}}></div>
                        <div className="image_experience_text_wrapper" style={{height: "360px"}}>
                            <span className="image_experience_text">{data.position}</span>
                            <span className="image_experience_company">{data.company}</span>
                            <span className="image_experience_dates">{data.years}</span>
                        </div>
                    </div>
                    <div className="ag-timeline-card_info">
                    {/* <div className="ag-timeline-card_title">Season 1</div> */}
                    <div className="ag-timeline-card_desc">
                        {Li(data.impact, "text125 textwhite bold500 mtop20 textalignleft")}
                    </div>
                    </div>
                </div>
                <div className="ag-timeline-card_arrow"></div>
            </div>
        </div>
    )
}

// const ExperienceItem  

function useInterval(callback, delay) {
    const savedCallback = useRef();
  
    // Remember the latest function.
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);
  
    // Set up the interval.
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  }

  



export default Home;


