import { useDropzone } from "react-dropzone"

import styles from "./styles.module.scss"
import { useCallback, useState } from "react";
import axios from "../../services/axios";

function base64ToFile(base64String: string, filename: string): File {
    const arr = base64String.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : '';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
}

export default function PNGConverter() {

    const [previews, setPreviews] = useState<any[]>([]);
    const [downloads, setDownloads] = useState<any[]>([])

    const onDrop = useCallback((acceptedFiles: any) => {
        acceptedFiles.forEach((file: any) => {
            const reader = new FileReader();

            reader.onloadend = () => {
                setPreviews(prev => [...prev, { name: file.name, src: reader.result }]);
            };

            reader.readAsDataURL(file);
        });
    }, []);

    function removeOneImage(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, index: number) {
        event.stopPropagation()
        setPreviews(prev => prev.filter((_, i) => i !== index));
    }

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'image/png': ['.png'],
        },
        multiple: true,
        onDrop,
    });

    async function submitConvert(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const newDownloads: { name: string; url: string }[] = [];

        for (let i = 0; i < previews.length; i++) {
            const image = previews[i];
            const body = new FormData();
            body.append("imagem", base64ToFile(image.src, image.name));

            try {
                const response = await axios.post("/processar", body);

                if (response.status === 200) {
                    newDownloads.push({ name: response.data.files[0].filename, url: response.data.files[0].url });
                } else {
                    newDownloads.push({ name: image.name, url: "error" })
                }
            } catch (err) {
                console.error(`Erro ao processar imagem ${image.name}:`, err);
            }
        }

        setDownloads(newDownloads);

        setPreviews([]);
    }


    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Conversor de imagens .png para .data</h1>
                <p>
                    Esta ferramenta foi desenvolvida para converter imagens no formato
                    PNG em arquivos .data, compatíveis com a linguagem de máquina RISC-V.
                    Para utilizá-la, envie a imagem desejada no formato PNG e a ferramenta
                    irá processar automaticamente os dados de cor, gerando um arquivo .data
                    com os valores hexadecimais correspondentes. Esse formato é ideal para
                    utilização em projetos que envolvem manipulação de memória ou exibição
                    gráfica em Assembly RISC-V.
                </p>
            </header>

            <form onSubmit={submitConvert}>
                <div className={styles.filesContainer} {...getRootProps()}>
                    <input {...getInputProps()} />
                    <p>Arraste e solte arquivos aqui, ou clique para selecionar</p>
                    <div className={styles.imagesContainer}>
                        {
                            previews.length > 0 ? (
                                previews.map((img, index) => {
                                    return (
                                        <div key={index} className={styles.imageContainer}>
                                            <button
                                                type="button"
                                                onClick={(event) => removeOneImage(event, index)}
                                            >🗑️</button>
                                            <img
                                                key={index}
                                                src={img.src}
                                                alt="Preview"
                                            />
                                        </div>
                                    )
                                })
                            ) : null
                        }
                        {/* {preview && (
                        )} */}
                    </div>
                </div>

                <button className={styles.submitButton}>
                    converter
                </button>
            </form>

            {
                downloads.length > 0 && (
                    <div className={styles.downloadsContainer}>
                        {downloads.map((download, index) => {
                            if (download.url == "error") {
                                return (
                                    <div className={styles.download} key={index}>
                                        <label>Erro ao tentar converter {download.name}</label>
                                    </div>
                                )
                            } else {
                                return (
                                    <div className={styles.download} key={index}>
                                        <label>{download.name}</label>
                                        <a href={download.url}>Download</a>
                                    </div>
                                )
                            }
                        })}
                    </div>
                )
            }

        </div>
    )
}