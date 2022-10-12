<div id="top"></div>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/ethanhuang03/block-site">
    <img src="images/green_shield.png" alt="Logo" width="300" height="300">
  </a>

<h3 align="center">Smart Block Site</h3>

  <p align="center">
    A dynamic website blocker in order to improve user productivity. 
    <br />
    <a href="https://github.com/ethanhuang03/block-site"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/ethanhuang03/block-site">View Demo</a>
    ·
    <a href="https://github.com/ethanhuang03/block-site">Report Bug</a>
    ·
    <a href="https://github.com/ethanhuang03/block-site">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="features">Features</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Name Screen Shot][product-screenshot]](https://github.com/ethanhuang03/block-site)

The Dynamic Website Blocker is a browser extension that uses the concept of “rewarding” users a certain amount of time on demerit sites rather than outright banning them. This project came to fruition after discovering that most applications that help eliminate distractions are too rigid and inflexible. For example, instead of punishing users by removing access to a website, the Dynamic Website Blocker rewards users with time to access demerit sites, given they have spent enough time on merit sites. 

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- GETTING STARTED -->
## Getting Started
### Installation
1. Clone the repo
   ```sh
   git clone https://github.com/ethanhuang03/block-site.git
   ```
2. Navigate to link 
    ```
    chrome://extensions
    ```
3. Enable developer mode
4. Click Load unpacked
5. Select cloned folder at saved directory
   
<p align="right">(<a href="#top">back to top</a>)</p>

## Features
1. Autofill Common Sites: Auto fills block sites with common distractors
2. Merit Weight: Points added per minute on merit sites
3. Demerit Weight: Points subtracted per minute on demerit sites
4. Enable/Disable Settings: Once enabled, points will reset if disabled
5. Maximum Points Accumulated: A hard limit on points accumulated
6. Reset Points After Closure: Once enabled, points will reset if browser is closed
7. Permanent Block List: Permanently blocks websites
8. Block By Category: Permanently block websites by category (adult websites).

<!-- USAGE EXAMPLES -->
## Usage

1. Enter websites you want to limit usage (or permanently block) on separate lines
    ```
    youtube.com
    facebook.com
    discord.com
    ```
    Sites starting with ! will be exception to the rule, allowed
    ```
    !https://www.youtube.com/watch?v=dQw4w9WgXcQ
    ```
    Otherwise click _Autofill Common Sites_ to automaticall fill potential common distractors

2. Select an option in _What to do when a site is blocked_  
3. Edit _Merit Weight_ and _Demerit Weight_ or leave as default
5. Input Optional Settings
4. Enable Blocker

_For more examples, please refer to the [Documentation](https://github.com/ethanhuang03/block-site)_

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap
See the [open issues](https://github.com/ethanhuang03/block-site) for a full list of proposed features (and known issues).

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Ethan Huang - [@twitter_handle](https://twitter.com/twitter_handle) - ethanhuang301@gmail.com

Project Link: [https://github.com/ethanhuang03/block-site](https://github.com/ethanhuang03/block-site)

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments
* Icon Designed By: [EDP](https://www.instagram.com/peng.private/)
* [Block Site](https://github.com/penge/block-site)
  * The original code this project is based on by Penge
* README Template: [README](https://github.com/othneildrew/Best-README-Template)
* Alpha Testers:
  * Thanks to Big D

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[product-screenshot]: images/Screenshot.png
