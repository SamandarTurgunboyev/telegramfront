function ContextMenu(props) {
    return (
        <div>
            {props.menuVisible && (
                <ul
                    style={{
                        position: 'absolute',
                        top: `${props.menuPosition?.y}px`,
                        left: `${props.menuPosition?.x}px`,
                        backgroundColor: 'white',
                        boxShadow: '0px 0px 10px rgba(0,0,0,0.2)',
                        listStyle: 'none',
                        padding: '10px',
                        margin: 0,
                        zIndex: 3
                    }}
                >
                    {props.children}
                </ul>
            )}
        </div>
    );
}

export default ContextMenu