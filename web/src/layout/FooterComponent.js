import { Layout } from "antd";
import React, { useEffect, useState } from 'react';
import brandingApi from "../api/branding";
import { NT_PACKAGE } from "../utils/utils";

const {Footer} = Layout;

let _package = NT_PACKAGE();

const FooterComponent = () => {

    let [branding, setBranding] = useState({});

    useEffect(() => {
        const x = async () => {
            let branding = await brandingApi.getBranding();
            document.title = branding['name'];
            setBranding(branding);
        }
        x();
    }, []);

    return (
        <Footer style={{textAlign: 'center'}}>
            {branding['copyright']} Version:{branding['version']}
        </Footer>
    );
}

export default FooterComponent;