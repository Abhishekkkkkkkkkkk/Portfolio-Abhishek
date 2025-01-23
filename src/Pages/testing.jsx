import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const TestAOS = () => {
    useEffect(() => {
        // Inisialisasi AOS
        AOS.init();

        // Function to check the will-change property.
        const checkWillChange = () => {
            // Retrieve all elements with the data-aos attribute.
            const aosElements = document.querySelectorAll('[data-aos]');
            
            console.log(`Ditemukan ${aosElements.length} elemen dengan data-aos`);
            
            aosElements.forEach((element, index) => {
                // Add a border to an element.
                element.style.border = '2px dashed red';
                
                // Retrieve the computed style.
                const computedStyle = window.getComputedStyle(element);
                const willChange = computedStyle.getPropertyValue('will-change');
                
                console.log(`Element ${index + 1}:`, {
                    'data-aos': element.getAttribute('data-aos'),
                    'will-change': willChange,
                    'element': element.tagName,
                    'classes': element.className
                });
            });
        };

        // Perform a check after AOS is initialized.
        setTimeout(checkWillChange, 100);
    }, []);

    return (
        <>
            <style>
                {`
                    [data-aos] {
                        will-change: transform, opacity !important;
                    }
                `}
            </style>

           
        </>
    );
};

export default TestAOS;
