    import React, { useState, useRef, useEffect } from 'react';
    import { Link } from 'react-router-dom';
    
    import redbook from '../assets/notebookList/redbook.png'
    import greenbook from '../assets/notebookList/greenbook.png'
    import greenbook2 from '../assets/notebookList/greenbook2.png'
    import greenbook3 from '../assets/notebookList/greenbook3.png'
    import greenbook4 from '../assets/notebookList/greenbook4.png' 
    import greenbook5 from '../assets/notebookList/greenbook5.png'
    import greenbook6 from '../assets/notebookList/greenbook6.png'
    import greenbook7 from '../assets/notebookList/greenbook7.png'
    import greenbook8 from '../assets/notebookList/greenbook8.png'
    import greenbook9 from '../assets/notebookList/greenbook9.png'
    import greenbook10 from '../assets/notebookList/greenbook10.png'
    import greenbook11 from '../assets/notebookList/greenbook11.png'
    import greenbook12 from '../assets/notebookList/greenbook12.png'
    import greenbook13 from '../assets/notebookList/greenbook13.png'
    import greenbook14 from '../assets/notebookList/greenbook14.png'
    import greenbook15 from '../assets/notebookList/greenbook15.png'
    import greenbook16 from '../assets/notebookList/greenbook16.png'

    import '../css/NotebookList.css'


    function NotebookList() {
        return (
            <>


                <Link to="/notebook" className="notebook-link">
                    <img src={redbook} alt="red notebook" className="notebook-img" />
                </Link>
                <p className='greenbook'><img src={greenbook} alt="green notebook" className="greenbook-img" /></p>
                {/* <p className='greenbook2'><img src={greenbook2} alt="green notebook" className="greenbook-img" /></p>
                <p className='greenbook3'><img src={greenbook3} alt="green notebook" className="greenbook-img" /></p>
                <p className='greenbook4'><img src={greenbook4} alt="green notebook" className="greenbook-img" /></p>
                <p className='greenbook5'><img src={greenbook5} alt="green notebook" className="greenbook-img" /></p>
                <p className='greenbook6'><img src={greenbook6} alt="green notebook" className="greenbook-img" /></p>
                <p className='greenbook7'><img src={greenbook7} alt="green notebook" className="greenbook-img" /></p>
                <p className='greenbook8'><img src={greenbook8} alt="green notebook" className="greenbook-img" /></p>
                <p className='greenbook9'><img src={greenbook9} alt="green notebook" className="greenbook-img" /></p>
                <p className='greenbook10'><img src={greenbook10} alt="green notebook" className="greenbook-img" /></p>
                <p className='greenbook11'><img src={greenbook11} alt="green notebook" className="greenbook-img" /></p>
                <p className='greenbook12'><img src={greenbook12} alt="green notebook" className="greenbook-img" /></p>
                <p className='greenbook13'><img src={greenbook13} alt="green notebook" className="greenbook-img" /></p>
                <p className='greenbook14'><img src={greenbook14} alt="green notebook" className="greenbook-img" /></p>
                <p className='greenbook15'><img src={greenbook15} alt="green notebook" className="greenbook-img" /></p>
                <p className='greenbook16'><img src={greenbook16} alt="green notebook" className="greenbook-img" /></p> */}
        </>
    )
    }

    export default NotebookList
