import { definePlugin, ServerAPI, staticClasses } from "decky-frontend-lib";
import { FaGamepad } from "react-icons/fa";
import { getTranslateFunc } from "./TranslationsF";
//import { GlobalContext } from "./context/globalContext";
// import { useState } from "react";
import { GlobalContextProvider } from "./context/globalContext";
//
// components
//
import Content from "./components/Content";

//
// hooks
//

//
// imports & requires
//
import { logo } from "./common/images";
import configureRouter from "./router/configureRouter";
// import getSettings from "./router/getSettings";

export default definePlugin((serverAPI: ServerAPI) => {
  //
  // i18
  //

  //
  // Web services
  //

  //
  // Const & Vars
  //
  const t = getTranslateFunc();
  let isFirstWatching = true;
  let isFirstUploading = true;
  let isFirstInactive = true;
  let isFirstScraping = true;
  let showToast = false;
  let intervalid: any;

  //
  // Functions
  //

  const checkCloudStatus = () => {
    //console.log("checkCloudStatus");
    serverAPI
      .callPluginMethod("emudeck", { command: "cloud_decky_check_status" })
      .then((response) => {
        const result = response.result;
        let bodyMessage: any = "";
        //console.log({ result });
        if (result === "started" && isFirstWatching) {
          isFirstWatching = false;
          isFirstUploading = true;
          isFirstInactive = true;
          showToast = true;
          bodyMessage = t("startWatcherBody");
        }
        if (result === "uploading" && isFirstUploading) {
          isFirstWatching = true;
          isFirstUploading = false;
          isFirstInactive = true;
          showToast = true;
          bodyMessage = t("uploadingWatcherBody");
        }

        if (result === "finished" && isFirstInactive) {
          isFirstWatching = true;
          isFirstUploading = true;
          isFirstInactive = false;
          showToast = true;
          bodyMessage = t("exitWatcherBody");
        }

        if (result === "disabled") {
          isFirstWatching = true;
          isFirstUploading = true;
          isFirstInactive = true;
          showToast = false;
          bodyMessage = "disabled";
        }

        if (result === "noInternet") {
          isFirstWatching = true;
          isFirstUploading = true;
          isFirstInactive = true;
          showToast = true;
          bodyMessage = t("noInternetWatcherBody");
        }

        // Game Launcher
        if (result === "scraping" && isFirstScraping) {
          isFirstScraping = false;
          showToast = true;
          bodyMessage = t("scrapingWatcherBody");
        }

        if (showToast) {
          serverAPI.toaster.toast({
            title: "EmuDeck CloudSync",
            body: bodyMessage,
            logo: <img width="20" style={{ marginTop: "8px", marginLeft: "10px" }} src={logo} />,
          });
        }
        showToast = false;
        bodyMessage = "";
      })
      .catch((error) => {
        //console.log({ error });
        serverAPI.toaster.toast({
          title: "EmuDeck CloudSync",
          body: error,
          logo: <img width="20" style={{ marginTop: "8px", marginLeft: "10px" }} src={logo} />,
        });
      });
  };

  //
  // States
  //

  // const [statePage, setStatePage] = useState<{
  //   settingsEmuDeck: any;
  //   stateAPI: ServerAPI;
  // }>({
  //   settingsEmuDeck: undefined,
  //   stateAPI: serverAPI,
  // });

  //
  // UseEffects
  //

  //
  // Logic
  //

  intervalid = setInterval(() => {
    checkCloudStatus();
  }, 2000);

  // let state;
  // const getSettings = () => {
  //   serverAPI.callPluginMethod("getSettings", {}).then((response: any) => {
  //     const result: any = response.result;
  //     const config: any = JSON.parse(result);
  //     state = { serverAPI: serverAPI, config: config };
  //   });
  // };

  configureRouter(serverAPI, true);
  // getSettings();

  //
  // Render
  //

  //   const [statePage, setStatePage] = useState<{
  //     settingsEmuDeck: any;
  //     stateAPI: ServerAPI;
  //   }>({
  //     settingsEmuDeck: getSettings(),
  //     stateAPI: serverAPI,
  //   });
  //
  //   const { settingsEmuDeck } = statePage;

  return {
    title: <div className={staticClasses.Title}>EmuDecky</div>,
    content: (
      <GlobalContextProvider emuDeckState={{ serverAPI: serverAPI }}>
        <Content serverAPI={serverAPI} />
      </GlobalContextProvider>
    ),
    //content: <Content serverAPI={serverAPI} />,
    icon: <FaGamepad />,
    onDismount() {
      //console.log("Dismount");
      //console.log("Cleaning up Interval");
      clearInterval(intervalid);
      configureRouter(serverAPI, false);
    },
  };
});
