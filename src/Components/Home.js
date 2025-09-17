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
        const REG_ZOOM_SPEED = .4; // Base speed (halved since we'll multiply by 2.0)
        const AUTO_ZOOM_SPEED_BASE = .05; // Base auto speed (halved since we'll multiply by 2.0)
        const init_opacity = 5;
        const end_opacity = 20;
    
        const init_photo_opacity = 2;
        const end_photo_opacity = 25;
    
        const zoom_min = 1;
        const zoom_max = 30;

        const auto_zoom_delay = 15;
    
        const rev_deadband = 0.2;

        // EDITABLE ZOOM FOCAL POINT - Set the X,Y coordinates (0-100%) where zoom should focus
        // These coordinates represent the focal point on the ORIGINAL image
        const ZOOM_FOCAL_POINT_X = 58.5; // Percentage from left (0-100)
        const ZOOM_FOCAL_POINT_Y = 47; // Percentage from top (0-100)

        // ZOOM SPEED MULTIPLIER - Controls how fast zooming happens
        // 2.0 = current speed, 4.0 = twice as fast, 1.0 = half as fast
        const ZOOM_SPEED_MULTIPLIER = 2.0;
    /**********************************************
        States
    ***********************************************/
        const [zoom, setZoom] = useState(1.0);
        const [goPastLanding, setGoPastLanding] = useState(false);
        const [timer, setTimer] = useState(-1);
        const [runTimer, setRunTimer] = useState(false);
        const [panels_rollover_1_Yvals, update_panels_rollover_1_Yvals] = useState([])
        const [autoZoomSpeed, setAutoZoomSpeed] = useState(AUTO_ZOOM_SPEED_BASE)

        const [rerender, setRerender] = useState();
        const [afterRender, setAfterRender] = useState();

        // Data states
        const [educationData, setEducationData] = React.useState([])    
        const [experienceData, setExperienceData] = React.useState([])
        
    /**********************************************
        Hooks
    ***********************************************/

    React.useEffect(() => {
    // const typed = new Typed(el.current, {
    //     strings: ['Software Engineer', 'Reseacher', 'Robotics Engineer', 'Entrepreneur', 'Competitive Programmer'],
    //     typeSpeed: 50,
    //     backSpeed: 20,
    //     startDelay: 0,
    //     loop: true,
    //     backDelay: 1000,
    //     onBegin: (self) => {
    //         if(currentcount++ == 1) {
    //             self.startDelay = 2400
    //         } else {
    //             self.startDelay = 0
    //         }
    //     },
    // });

    return () => {
        // Destroy Typed instance during cleanup to stop animation
        // typed.destroy();
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

    // Update transform-origin on window resize
    React.useEffect(() => {
        const handleResize = () => {
            const el = document.getElementById("imagetozoomhome");
            if (el) {
                const transformOrigin = calculateTransformOrigin();
                el.style.transformOrigin = transformOrigin;
            }
        };
        
        window.addEventListener("resize", handleResize);
        // Set initial transform-origin
        handleResize();
        
        return () => window.removeEventListener("resize", handleResize);
    }, [])

    // Scroll-triggered animations for experience cards
    React.useEffect(() => {
        const observerOptions = {
            threshold: 0.1, // Lower threshold for faster triggering
            rootMargin: '0px 0px 100px 0px' // Start animation earlier
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !entry.target.classList.contains('animate-in')) {
                    // Much smaller delay for faster response
                    const delay = parseInt(entry.target.dataset.index) * 50; // Reduced from 200ms to 50ms
                    
                    // Use requestAnimationFrame for better performance
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            if (!entry.target.classList.contains('animate-in')) {
                                entry.target.classList.add('animate-in');
                            }
                        }, delay);
                    });
                    
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Wait for next tick to ensure DOM is ready
        setTimeout(() => {
            const cards = document.querySelectorAll('.experience-card');
            cards.forEach(card => observer.observe(card));
        }, 100);

        return () => observer.disconnect();
    }, [experienceData])

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
        var panels_rollover_1 = $('.panel-rollover-1')
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
    
    // Calculate responsive transform-origin based on screen size and focal point
    function calculateTransformOrigin() {
        const el = document.getElementById("imagetozoomhome");
        if (!el) return `${ZOOM_FOCAL_POINT_X}% ${ZOOM_FOCAL_POINT_Y}%`;
        
        // Get the current image element dimensions
        const rect = el.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Calculate how the image is positioned relative to the viewport
        // Since background-size: cover is used, we need to account for cropping
        const imageAspectRatio = 1920 / 1080; // Adjust this to match your actual image dimensions
        const viewportAspectRatio = windowWidth / windowHeight;
        
        let adjustedX = ZOOM_FOCAL_POINT_X;
        let adjustedY = ZOOM_FOCAL_POINT_Y;
        
        // If viewport is wider than image aspect ratio, image is cropped vertically
        if (viewportAspectRatio > imageAspectRatio) {
            // Image fills width, adjust Y coordinate for vertical cropping
            const visibleImageHeight = (imageAspectRatio / viewportAspectRatio) * 100;
            const cropTop = (100 - visibleImageHeight) / 2;
            adjustedY = ((ZOOM_FOCAL_POINT_Y - cropTop) / visibleImageHeight) * 100;
            adjustedY = Math.max(0, Math.min(100, adjustedY));
        } 
        // If viewport is taller than image aspect ratio, image is cropped horizontally
        else {
            // Image fills height, adjust X coordinate for horizontal cropping
            const visibleImageWidth = (viewportAspectRatio / imageAspectRatio) * 100;
            const cropLeft = (100 - visibleImageWidth) / 2;
            adjustedX = ((ZOOM_FOCAL_POINT_X - cropLeft) / visibleImageWidth) * 100;
            adjustedX = Math.max(0, Math.min(100, adjustedX));
        }
        
        return `${adjustedX}% ${adjustedY}%`;
    }

    function updateZoom(deltaY, ZOOM_SPEED = REG_ZOOM_SPEED) {
        let el = document.getElementById("imagetozoomhome");
        let temp_zoom = zoom;
        // Apply the zoom speed multiplier
        const effectiveZoomSpeed = ZOOM_SPEED * ZOOM_SPEED_MULTIPLIER;
        temp_zoom += (deltaY > 0) ? effectiveZoomSpeed : (deltaY > -.2 ? 0 : -effectiveZoomSpeed);
        temp_zoom = Math.max(zoom_min, Math.min(temp_zoom, zoom_max));
        
        // Update transform-origin dynamically based on screen size
        const transformOrigin = calculateTransformOrigin();
        el.style.transformOrigin = transformOrigin;
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
        // Apply multiplier to auto zoom speed as well
        const newSpeed = autoZoomSpeed + autoZoomSpeed;
        setAutoZoomSpeed(newSpeed);
        updateZoom(1, newSpeed);
    }, runTimer ? auto_zoom_delay : null);
    function pauseTimer() {
        setRunTimer(false);
    }
    function autozoom() {   
        setAutoZoomSpeed(AUTO_ZOOM_SPEED_BASE); // Reset speed when starting
        setRunTimer(true);
    }

    function update_windows_rollover_1() {
        var panels_rollover_1 = $('.panel-rollover-1')
        var _window = $(window);
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
        Get Data Hooks
    ***********************************************/
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
                        {/* I am a */}
                         <span className="underlineWrapper gradtext"><span ref={el} /></span>
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
                                        I like to <span className="buildemphasis">build</span>.
                                    </p>
                                </div>
                                <div className="col-lg-6">
                                    <p className="aboutmefulltext bold500 text150 mtop50 mleft20">
                                        Hey, Thanks for stopping by! I'm a student at the University of Pennsylvania (co '27) pursuing a dual degree as part of the Jerome Fisher Program in Management and Technology.
                                        <br /><br />
                                        I'm originally from Dallas. As a child I loved to build entire empires from legos. I now have a passion for building things a bit more intricate, like <span className="anchorwrapper"><a href="https://github.com/pulkith" target="_blank">websites & apps</a></span>, <a href="https://coyotronicsfrchhs.wixsite.com/8816" target="_blank"> robots</a>, and a <a href="https://www.crunchbase.com/organization/neurose" target="_blank">startup</a>.
                                        <br /><br />
                                        I'm also interested in research, especially in Machine Learning, Large Language Models, and Computational Neuroscience. Checkout my papers <a href="https://research.pulkith.com" target="_blank">here</a>. 
                                        <br /><br />
                                        In my spare time, I enjoy reading, exploring, volleyball, F1, poker, competitive programming, playing the guitar, and quesidillas.
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
                    <div className="experience-header">
                        <h2 className="experience-title whitetext text350 bold900 spacedLetters005 lineheight70">Experience</h2>
                    </div>
                    <div className="experience-grid">
                        {experienceData.map((d, i) => <ExperienceComponent key={i} data={d} index={i} />)}
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
function arrayli(d, title, formattitle, formatlist, subtitle = "") {
    return (<div>
        <div className={formattitle}>{title}</div>
        {subtitle && <div className={formatlist}>{subtitle}</div>}
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
                    {arrayli(data.coursework, "Relevant Coursework", "text150 zbold500 whitetext mtop20", "lightslate text125", "(*) indicates Graduate Level ")}
                </div>
            </div>
        </div>
    )
}

function ExperienceComponent(props) {
    let { data, index } = props
    
    // Check if there's a short description, otherwise use the full description
    const hasShortDescription = data.shortDescription && data.shortDescription.trim().length > 0;
    
    return(
        <div className={`experience-card experience-card-${index}`} data-index={index}>
            <div className="experience-card-inner">
                <div className="experience-top">
                    {data.image && (
                        <div className="experience-image">
                            <img src={data.image} alt={`${data.company} logo`} />
                        </div>
                    )}
                    <div className="experience-header">
                        <h3 className="experience-position">{data.position}</h3>
                        <div className="experience-company">{data.company}</div>
                    </div>
                </div>
                
                <div className="experience-meta" style={{justifyContent: data.location ? "center" : "flex-start"}}>
                    <span className="experience-dates">{data.years}</span>
                    {data.location && <span className="experience-dates">{data.location}</span>}
                </div>
                
                <div className="experience-description">
                    {hasShortDescription ? (
                        <p className="experience-short-desc">{data.shortDescription}</p>
                    ) : (
                        Array.isArray(data.impact) ? (
                            <ul>
                                {data.impact.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        ) : (
                            <p>{data.impact}</p>
                        )
                    )}
                </div>
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


