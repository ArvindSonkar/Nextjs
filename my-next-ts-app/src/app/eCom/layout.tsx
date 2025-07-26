import { ReactNode } from "react";

interface EcommerceLayoutProps {
    children: ReactNode;
}

const EcommerceLayout = ({children}: EcommerceLayoutProps) => {

    return <>
        <div>Ecommerce Layout</div>
        {children}
    </>
}

export default EcommerceLayout;