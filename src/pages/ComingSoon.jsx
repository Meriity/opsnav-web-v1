import React from "react";

const ComingSoon = () =>{

const handleLogin = () => {
  window.location.href = "https://legacy.opsnav.com";
};

    return (
        <>
             <div className="relative min-h-screen bg-cover bg-center text-black"
                    style={{ backgroundImage: "url('/home_bg.jpg')" }}
                >
                    {/* <div className="absolute inset-0 bg-black/60" /> */}

                    <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-24 md:py-32">
                        <img src="/Logo.png" alt="OpsNav Logo" className="h-8 mx-auto sm:h-8 md:h-12 lg:h-12" />
                    <h1 className="text-3xl md:text-3xl lg:text-5xl font-bold pt-20 max-w-7xl">
                        We are temporarily redirecting users to our legacy system for maintenance. All services remain fully accessible at the new location. 
                    </h1>

                    <p className="mt-6 text-base md:text-lg max-w-4xl">
                        Thank you for your understanding during this transition.
                    </p>

                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        <button className="cursor-pointer bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6 py-3 rounded-md shadow" onClick={handleLogin}>
                            Continue
                        </button>
                    </div>
                    </div>

                   

                    {/* <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-center z-20 text-xl font-bold">
                        <img src="/Logo.png" alt="Opsnav Logo" className="h-8 mx-auto sm:h-8 md:h-12 lg:h-12" />
                    </div> */}
                </div>
        </>
    )
};

export default ComingSoon;